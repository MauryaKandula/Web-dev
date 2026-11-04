import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, initDatabase, runInTransaction } from './database.ts';
import { seedData } from './seed.ts';
import { MockPaymentProvider } from './services/payment.ts';
import { PrivateStorageProvider } from './services/storage.ts';
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  getRazorpayCredentials,
  verifyCheckoutSignature,
  verifyWebhookSignature
} from './services/razorpay.ts';

const app = express();
const PORT = Number(process.env.PORT ?? 3005);
if (!Number.isSafeInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
function isValidPriceInr(value: unknown): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) return false;
  const paise = Math.round(value * 100);
  return Number.isSafeInteger(paise) && Math.abs(value * 100 - paise) < 1e-7;
}
const configuredJwtSecret = process.env.JWT_SECRET?.trim();
if (
  process.env.NODE_ENV === 'production' &&
  (!configuredJwtSecret || configuredJwtSecret.length < 32 || /replace|example|placeholder|change.?me/i.test(configuredJwtSecret))
) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 characters before production startup.');
}
const JWT_SECRET = configuredJwtSecret || crypto.randomBytes(32).toString('hex');

app.use(cors());
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));

// Demo users and demo orders must never be inserted into a production database.
initDatabase();
if (process.env.NODE_ENV !== 'production') seedData();
// -----------------------------------------------------------------------------
// AUTH MIDDLEWARE
// -----------------------------------------------------------------------------
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

// -----------------------------------------------------------------------------
// 1. AUTH ROUTES
// -----------------------------------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response): void => {
  const { email: rawEmail, password, name: rawName } = req.body || {};
  const role = req.body?.role === 'creator' ? 'creator' : 'customer';
  if (
    typeof rawEmail !== 'string' ||
    typeof password !== 'string' ||
    typeof rawName !== 'string' ||
    !rawEmail.trim() ||
    password.length < 8 ||
    !rawName.trim()
  ) {
    res.status(400).json({ error: 'Enter a valid email and name, and use a password with at least 8 characters' });
    return;
  }

  const email = rawEmail.trim().toLowerCase();
  const name = rawName.trim().slice(0, 100);
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'User with this email already exists' });
    return;
  }

  const id = `usr_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
  const password_hash = bcrypt.hashSync(password, 10);
  const avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  const created_at = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, avatar_url, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, email, password_hash, name, role, avatar_url, created_at);

  const token = jwt.sign({ id, email, role, name }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ user: { id, email, name, role, avatar_url }, token });
});

app.post('/api/auth/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  const developmentSeedIds = ['usr_admin', 'usr_creator_1', 'usr_creator_2', 'usr_customer'];
  if (
    !user ||
    !bcrypt.compareSync(password, user.password_hash) ||
    (process.env.NODE_ENV === 'production' && developmentSeedIds.includes(user.id))
  ) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url },
    token
  });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const user = db.prepare('SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = ?').get(req.user!.id);
  res.json({ user });
});

// Demo switch role endpoint for frictionless pair testing
app.post('/api/auth/demo-switch', (req: Request, res: Response): void => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Demo accounts are disabled' });
    return;
  }

  const { role } = req.body; // 'customer' | 'creator' | 'admin'
  let targetEmail = 'customer@toolforge.test';
  if (role === 'creator') targetEmail = 'creator@toolforge.test';
  if (role === 'admin') targetEmail = 'admin@toolforge.test';

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(targetEmail) as any;
  if (!user) {
    res.status(404).json({ error: 'Demo user not found' });
    return;
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url },
    token
  });
});

// -----------------------------------------------------------------------------
// 2. PRODUCT DISCOVERY & REVIEWS ROUTES
// -----------------------------------------------------------------------------
function withVerifiedProductMetrics(product: any) {
  const metrics = db.prepare(
    "SELECT (SELECT COUNT(*) FROM orders WHERE product_id = ? AND status = 'completed' AND payment_method = 'razorpay') AS sales_count, COALESCE((SELECT ROUND(AVG(rating), 1) FROM reviews WHERE product_id = ?), 0) AS rating_avg, (SELECT COUNT(*) FROM reviews WHERE product_id = ?) AS rating_count"
  ).get(product.id, product.id, product.id) as any;
  return { ...product, ...metrics };
}

app.get('/api/products', (req: Request, res: Response): void => {
  const { category, search, maxPrice, sort } = req.query;
  let query = "SELECT p.*, u.name as creator_name, u.avatar_url as creator_avatar FROM products p JOIN users u ON p.creator_id = u.id WHERE p.status = 'approved'";
  const params: any[] = [];

  if (category && category !== 'all') {
    query += ' AND p.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (p.title LIKE ? OR p.tagline LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (maxPrice) {
    query += ' AND p.price_inr <= ?';
    params.push(Number(maxPrice));
  }

  if (sort === 'price_asc') query += ' ORDER BY p.price_inr ASC';
  else if (sort === 'price_desc') query += ' ORDER BY p.price_inr DESC';
  else if (sort === 'rating') query += ' ORDER BY (SELECT AVG(r.rating) FROM reviews r WHERE r.product_id = p.id) DESC';
  else query += " ORDER BY (SELECT COUNT(*) FROM orders o WHERE o.product_id = p.id AND o.status = 'completed' AND o.payment_method = 'razorpay') DESC";

  const products = (db.prepare(query).all(...params) as any[]).map(withVerifiedProductMetrics);
  res.json({ products });
});

app.get('/api/products/:slug', (req: Request, res: Response): void => {
  const slug = String(req.params.slug);
  const product = db.prepare(`
    SELECT p.*, u.name as creator_name, u.avatar_url as creator_avatar
    FROM products p
    JOIN users u ON p.creator_id = u.id
    WHERE p.slug = ? OR p.id = ?
  `).get(slug, slug) as any;

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  Object.assign(product, withVerifiedProductMetrics(product));
  const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(product.id);
  res.json({ product, reviews });
});

app.post('/api/products/:id/reviews', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const id = String(req.params.id);
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5 || !comment) {
    res.status(400).json({ error: 'Valid rating (1-5) and comment required' });
    return;
  }

  const reviewId = `rev_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
  db.prepare(`
    INSERT INTO reviews (id, product_id, user_id, user_name, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(reviewId, id, req.user!.id, req.user!.name, rating, comment, new Date().toISOString());

  // Recalculate average rating
  const agg = db.prepare('SELECT AVG(rating) as avg_r, COUNT(*) as c FROM reviews WHERE product_id = ?').get(id) as any;
  if (agg) {
    db.prepare('UPDATE products SET rating_avg = ?, rating_count = ? WHERE id = ?').run(
      Math.round(agg.avg_r * 10) / 10,
      agg.c,
      id
    );
  }

  res.status(201).json({ success: true, reviewId });
});

// -----------------------------------------------------------------------------
// 3. CHECKOUT & ORDERS (IDEMPOTENT & COMMISSION AUTOMATION)
// -----------------------------------------------------------------------------
app.post('/api/orders/checkout', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({ error: 'Simulated checkout is disabled' });
    return;
  }

  const { productId, paymentMethod = 'upi_simulated', idempotencyKey } = req.body || {};
  const userId = req.user!.id;

  if (
    typeof productId !== 'string' ||
    !productId ||
    !['upi_simulated', 'card_simulated'].includes(paymentMethod)
  ) {
    res.status(400).json({ error: 'Provide a productId and a supported development payment method' });
    return;
  }

  // Idempotency verification
  if (idempotencyKey) {
    const existingOrder = db.prepare('SELECT * FROM orders WHERE idempotency_key = ?').get(idempotencyKey) as any;
    if (existingOrder) {
      if (existingOrder.user_id !== userId) {
        res.status(409).json({ error: 'Idempotency key is already in use' });
        return;
      }
      const item = db.prepare(
        'SELECT ul.license_key, p.title FROM user_library ul JOIN products p ON p.id = ul.product_id WHERE ul.user_id = ? AND ul.product_id = ?'
      ).get(userId, existingOrder.product_id) as any;
      if (!item) {
        res.status(409).json({ error: 'The previous checkout has no completed library entitlement' });
        return;
      }
      res.json({
        success: true,
        orderId: existingOrder.id,
        transactionId: existingOrder.transaction_id,
        licenseKey: item.license_key,
        productTitle: item.title,
        amountInr: existingOrder.amount_inr
      });
      return;
    }
  }

  // Check product existence
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  if (product.status !== 'approved') {
    res.status(409).json({ error: 'This product is not published for purchase' });
    return;
  }
  if (!isValidPriceInr(product.price_inr) || !PrivateStorageProvider.getDownloadPath(product.download_filename)) {
    res.status(409).json({ error: 'This product does not have a downloadable package available yet' });
    return;
  }

  // Check if already in user library
  const alreadyOwned = db.prepare('SELECT id FROM user_library WHERE user_id = ? AND product_id = ?').get(userId, productId);
  if (alreadyOwned) {
    res.status(400).json({ error: 'You already own this item. Access it from your Library.' });
    return;
  }

  // Retrieve platform commission rate
  const commConfig = db.prepare("SELECT value FROM platform_config WHERE key = 'default_commission_rate'").get() as any;
  const commissionRate = commConfig ? parseFloat(commConfig.value) : 0.10;

  // Process payment
  const paymentResult = MockPaymentProvider.processPayment({
    productId,
    amountInr: product.price_inr,
    paymentMethod,
    idempotencyKey
  }, commissionRate);

  if (!paymentResult.success) {
    res.status(402).json({ error: paymentResult.error || 'Payment failed' });
    return;
  }

  // Save order and credit library in single transaction
  const orderId = `ord_${uuidv4().replace(/-/g, '').slice(0, 14)}`;
  const licenseKey = `TF-${uuidv4().slice(0, 4).toUpperCase()}-${uuidv4().slice(4, 8).toUpperCase()}-${uuidv4().slice(9, 13).toUpperCase()}`;

  db.prepare(`
    INSERT INTO orders (
      id, user_id, product_id, amount_inr, commission_rate,
      platform_fee_inr, creator_earnings_inr, status, payment_method,
      transaction_id, idempotency_key, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    orderId, userId, productId, paymentResult.amountInr, paymentResult.commissionRate,
    paymentResult.platformFeeInr, paymentResult.creatorEarningsInr, 'completed', paymentMethod,
    paymentResult.transactionId, idempotencyKey || null, paymentResult.processedAt
  );

  db.prepare(`
    INSERT INTO user_library (id, user_id, product_id, order_id, license_key, purchased_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(`lib_${uuidv4().replace(/-/g, '').slice(0, 12)}`, userId, productId, orderId, licenseKey, paymentResult.processedAt);

  // Update product sales count
  db.prepare('UPDATE products SET sales_count = sales_count + 1 WHERE id = ?').run(productId);

  res.status(201).json({
    success: true,
    orderId,
    transactionId: paymentResult.transactionId,
    licenseKey,
    productTitle: product.title,
    amountInr: paymentResult.amountInr
  });
});

// -----------------------------------------------------------------------------
// 3.1 RAZORPAY PAYMENT & WEBHOOK GATEWAY (PHASES 6 & 7)
// -----------------------------------------------------------------------------
function fulfillCapturedRazorpayPayment(orderId: string, paymentId: string) {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
  if (!order) throw new Error('Order not found');

  const libraryItem = db.prepare(
    'SELECT * FROM user_library WHERE user_id = ? AND product_id = ?'
  ).get(order.user_id, order.product_id) as any;

  if (order.status === 'completed') {
    if (order.transaction_id !== paymentId || !libraryItem) {
      throw new Error('Order is already completed with a different payment');
    }
    const existingProduct = db.prepare('SELECT title FROM products WHERE id = ?').get(order.product_id) as any;
    return {
      orderId,
      transactionId: paymentId,
      licenseKey: libraryItem.license_key,
      productTitle: existingProduct?.title || 'Software'
    };
  }

  if (order.status !== 'pending') throw new Error('Order is not awaiting payment');
  if (libraryItem) throw new Error('Product is already owned by this account');

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(order.product_id) as any;
  if (!product) throw new Error('Order product not found');

  const licenseKey = 'TF-RZP-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  const now = new Date().toISOString();

  runInTransaction(() => {
    const currentOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
    if (currentOrder.status === 'completed') {
      if (currentOrder.transaction_id !== paymentId) {
        throw new Error('Order was completed by a different payment');
      }
      return;
    }
    if (currentOrder.status !== 'pending') throw new Error('Order is not awaiting payment');

    const alreadyOwned = db.prepare(
      'SELECT id FROM user_library WHERE user_id = ? AND product_id = ?'
    ).get(order.user_id, order.product_id);
    if (alreadyOwned) throw new Error('Product is already owned by this account');

    db.prepare("UPDATE orders SET status = 'completed', transaction_id = ? WHERE id = ?")
      .run(paymentId, orderId);
    db.prepare(
      'INSERT INTO user_library (id, user_id, product_id, order_id, license_key, purchased_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      'lib_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12),
      order.user_id,
      order.product_id,
      orderId,
      licenseKey,
      now
    );
    db.prepare('UPDATE products SET sales_count = sales_count + 1 WHERE id = ?')
      .run(order.product_id);
  });

  const issuedItem = db.prepare(
    'SELECT license_key FROM user_library WHERE user_id = ? AND product_id = ?'
  ).get(order.user_id, order.product_id) as any;

  return {
    orderId,
    transactionId: paymentId,
    licenseKey: issuedItem.license_key,
    productTitle: product.title
  };
}

app.post('/api/payment/create-order', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { productId } = req.body || {};
  const userId = req.user!.id;

  if (typeof productId !== 'string' || !productId) {
    res.status(400).json({ error: 'productId is required' });
    return;
  }

  const credentials = getRazorpayCredentials();
  if (!credentials) {
    res.status(503).json({ error: 'Razorpay is not configured. Add server-side test keys before using checkout.' });
    return;
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as any;
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  if (product.status !== 'approved') {
    res.status(409).json({ error: 'This product is not published for purchase' });
    return;
  }
  if (!isValidPriceInr(product.price_inr) || !PrivateStorageProvider.getDownloadPath(product.download_filename)) {
    res.status(409).json({ error: 'This product does not have a downloadable package available yet' });
    return;
  }

  if (db.prepare('SELECT id FROM user_library WHERE user_id = ? AND product_id = ?').get(userId, productId)) {
    res.status(400).json({ error: 'Product already owned in your library' });
    return;
  }

  const existingPending = db.prepare(
    "SELECT id FROM orders WHERE user_id = ? AND product_id = ? AND status = 'pending' AND payment_method = 'razorpay' AND transaction_id GLOB 'pending_*' ORDER BY created_at DESC LIMIT 1"
  ).get(userId, productId) as any;

  if (existingPending) {
    res.status(200).json({
      success: true,
      orderId: existingPending.id,
      amountPaise: Math.round(product.price_inr * 100),
      currency: 'INR',
      productId: product.id,
      productTitle: product.title,
      priceInr: product.price_inr,
      keyId: credentials.keyId,
      notes: { userId, productId: product.id }
    });
    return;
  }

  const amountPaise = Math.round(product.price_inr * 100);
  const commissionConfig = db.prepare(
    "SELECT value FROM platform_config WHERE key = 'default_commission_rate'"
  ).get() as any;
  const commissionRate = commissionConfig ? parseFloat(commissionConfig.value) : 0.10;
  const platformFee = Math.round(product.price_inr * commissionRate * 100) / 100;
  const creatorEarnings = Math.round((product.price_inr - platformFee) * 100) / 100;
  const receipt = 'tf_' + crypto.randomUUID().replace(/-/g, '');

  try {
    const gatewayOrder = await createRazorpayOrder({
      amountPaise,
      receipt,
      notes: { userId, productId: product.id }
    }, credentials);

    db.prepare(
      'INSERT INTO orders (id, user_id, product_id, amount_inr, commission_rate, platform_fee_inr, creator_earnings_inr, status, payment_method, transaction_id, idempotency_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      gatewayOrder.id,
      userId,
      product.id,
      product.price_inr,
      commissionRate,
      platformFee,
      creatorEarnings,
      'pending',
      'razorpay',
      'pending_' + gatewayOrder.id,
      gatewayOrder.id,
      new Date().toISOString()
    );

    res.status(201).json({
      success: true,
      orderId: gatewayOrder.id,
      amountPaise: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      productId: product.id,
      productTitle: product.title,
      priceInr: product.price_inr,
      keyId: credentials.keyId,
      notes: { userId, productId: product.id }
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error instanceof Error ? error.message : 'Unknown error');
    res.status(502).json({ error: 'Razorpay could not create the order. Check the configured test credentials and try again.' });
  }
});

app.post('/api/payment/verify-payment', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  const userId = req.user!.id;

  if (
    typeof razorpay_order_id !== 'string' ||
    typeof razorpay_payment_id !== 'string' ||
    typeof razorpay_signature !== 'string'
  ) {
    res.status(400).json({ error: 'Razorpay order, payment, and signature are required' });
    return;
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(razorpay_order_id) as any;
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  if (order.user_id !== userId) {
    res.status(403).json({ error: 'Order does not belong to the authenticated user' });
    return;
  }

  const credentials = getRazorpayCredentials();
  if (!credentials) {
    res.status(503).json({ error: 'Razorpay payment verification is not configured' });
    return;
  }
  if (!verifyCheckoutSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    credentials.keySecret
  )) {
    res.status(400).json({ error: 'Invalid Razorpay checkout signature' });
    return;
  }

  try {
    const payment = await fetchRazorpayPayment(razorpay_payment_id, credentials);
    const expectedPaise = Math.round(order.amount_inr * 100);
    if (
      payment.order_id !== order.id ||
      payment.amount !== expectedPaise ||
      payment.currency !== 'INR'
    ) {
      res.status(400).json({ error: 'Razorpay payment does not match this order amount and currency' });
      return;
    }
    if (payment.status !== 'captured' || payment.captured !== true) {
      res.status(409).json({ error: 'Payment is not captured yet. Your library will update after Razorpay confirms capture.' });
      return;
    }

    const result = fulfillCapturedRazorpayPayment(order.id, payment.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment verification failed';
    if (message === 'Order not found') {
      res.status(404).json({ error: message });
      return;
    }
    if (message.includes('already completed') || message.includes('already owned') || message.includes('not awaiting payment')) {
      res.status(409).json({ error: message });
      return;
    }
    console.error('Razorpay payment verification failed:', message);
    res.status(502).json({ error: 'Razorpay payment could not be verified. Check payment status and retry.' });
  }
});

app.post('/api/payment/razorpay-webhook', (req: Request, res: Response): void => {
  const rawPayload = (req as any).rawBody;
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    res.status(503).json({ error: 'Razorpay webhook verification is not configured' });
    return;
  }
  if (!Buffer.isBuffer(rawPayload) || typeof signature !== 'string') {
    res.status(400).json({ error: 'A raw signed webhook request is required' });
    return;
  }
  if (!verifyWebhookSignature(rawPayload, signature, webhookSecret)) {
    res.status(400).json({ error: 'Invalid Razorpay webhook signature' });
    return;
  }

  const eventId = req.headers['x-razorpay-event-id'];
  const eventType = req.body?.event;
  if (typeof eventId !== 'string' || !eventId || eventId.length > 200 || typeof eventType !== 'string') {
    res.status(400).json({ error: 'Razorpay event ID and event type are required' });
    return;
  }

  const existingEvent = db.prepare('SELECT id, status FROM payment_webhooks WHERE event_id = ?').get(eventId) as any;
  if (existingEvent?.status === 'processed' || existingEvent?.status === 'ignored') {
    res.status(200).json({ status: 'duplicate', eventId });
    return;
  }
  if (!existingEvent) {
    db.prepare(
      'INSERT INTO payment_webhooks (id, event_id, event_type, payload, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(
      'wh_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12),
      eventId,
      eventType,
      JSON.stringify(req.body),
      'received',
      new Date().toISOString()
    );
  }

  if (eventType !== 'payment.captured') {
    db.prepare("UPDATE payment_webhooks SET status = 'ignored' WHERE event_id = ?").run(eventId);
    res.status(200).json({ status: 'ignored', eventId });
    return;
  }

  const payment = req.body?.payload?.payment?.entity;
  if (
    typeof payment?.id !== 'string' ||
    typeof payment?.order_id !== 'string' ||
    payment.status !== 'captured' ||
    payment.captured !== true
  ) {
    db.prepare("UPDATE payment_webhooks SET status = 'rejected' WHERE event_id = ?").run(eventId);
    res.status(400).json({ error: 'Webhook does not contain a captured payment' });
    return;
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(payment.order_id) as any;
  if (!order) {
    db.prepare("UPDATE payment_webhooks SET status = 'ignored' WHERE event_id = ?").run(eventId);
    res.status(200).json({ status: 'unknown_order', eventId });
    return;
  }

  if (
    payment.amount !== Math.round(order.amount_inr * 100) ||
    payment.currency !== 'INR'
  ) {
    db.prepare("UPDATE payment_webhooks SET status = 'rejected' WHERE event_id = ?").run(eventId);
    res.status(400).json({ error: 'Captured payment does not match the stored order amount and currency' });
    return;
  }

  try {
    fulfillCapturedRazorpayPayment(order.id, payment.id);
    db.prepare("UPDATE payment_webhooks SET status = 'processed' WHERE event_id = ?").run(eventId);
    res.status(200).json({ status: 'ok', received: true, eventId });
  } catch (error) {
    db.prepare("UPDATE payment_webhooks SET status = 'received' WHERE event_id = ?").run(eventId);
    console.error('Razorpay webhook fulfillment failed:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Payment event could not be processed; Razorpay may retry it.' });
  }
});
app.get('/api/orders/library', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const library = db.prepare(`
    SELECT ul.id, ul.license_key, ul.download_count, ul.purchased_at,
           p.id as product_id, p.title, p.tagline, p.version, p.category, p.download_filename, p.file_size_kb,
           u.name as creator_name
    FROM user_library ul
    JOIN products p ON ul.product_id = p.id
    JOIN users u ON p.creator_id = u.id
    WHERE ul.user_id = ?
    ORDER BY ul.purchased_at DESC
  `).all(req.user!.id);

  res.json({ library });
});

app.get('/api/orders/download/:productId', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const productId = String(req.params.productId);
  const ownership = db.prepare('SELECT id, download_count FROM user_library WHERE user_id = ? AND product_id = ?').get(req.user!.id, productId) as any;

  if (!ownership) {
    res.status(403).json({ error: 'Access forbidden: You do not have an active license for this software' });
    return;
  }

  const product = db.prepare('SELECT download_filename FROM products WHERE id = ?').get(productId) as any;
  const filename = product?.download_filename;
  const packagePath = filename ? PrivateStorageProvider.getDownloadPath(filename) : null;
  if (!packagePath) {
    res.status(404).json({ error: 'The package file is not available in private storage yet' });
    return;
  }

  // Increment download count
  db.prepare('UPDATE user_library SET download_count = download_count + 1 WHERE id = ?').run(ownership.id);

  const safeDownloadName = filename.replace(/[^A-Za-z0-9._-]/g, '_');
  res.download(packagePath, safeDownloadName, (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ error: 'The package file could not be read from private storage' });
    } else if (error) {
      res.destroy(error);
    }
  });
});

// -----------------------------------------------------------------------------
// 4. WISHLIST
// -----------------------------------------------------------------------------
app.get('/api/orders/wishlist', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const items = db.prepare(`
    SELECT w.id, w.added_at, p.*, u.name as creator_name
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    JOIN users u ON p.creator_id = u.id
    WHERE w.user_id = ?
    ORDER BY w.added_at DESC
  `).all(req.user!.id);

  res.json({ wishlist: items });
});

app.post('/api/orders/wishlist/toggle', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const { productId } = req.body;
  const existing = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(req.user!.id, productId) as any;

  if (existing) {
    db.prepare('DELETE FROM wishlist WHERE id = ?').run(existing.id);
    res.json({ inWishlist: false });
  } else {
    db.prepare('INSERT INTO wishlist (id, user_id, product_id, added_at) VALUES (?, ?, ?, ?)').run(
      `wish_${uuidv4().replace(/-/g, '').slice(0, 10)}`,
      req.user!.id,
      productId,
      new Date().toISOString()
    );
    res.json({ inWishlist: true });
  }
});

// -----------------------------------------------------------------------------
// 5. CREATOR STUDIO ROUTES
// -----------------------------------------------------------------------------
app.get('/api/creator/stats', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  const creatorId = req.user!.id;
  const products = db.prepare('SELECT * FROM products WHERE creator_id = ? ORDER BY created_at DESC').all(creatorId);

  const orders = db.prepare(`
    SELECT o.*, p.title as product_title
    FROM orders o
    JOIN products p ON o.product_id = p.id
    WHERE p.creator_id = ?
    ORDER BY o.created_at DESC
  `).all(creatorId) as any[];

  const totalGross = orders.reduce((sum, o) => sum + o.amount_inr, 0);
  const totalNet = orders.reduce((sum, o) => sum + o.creator_earnings_inr, 0);
  const totalPlatformFees = orders.reduce((sum, o) => sum + o.platform_fee_inr, 0);

  res.json({
    stats: {
      totalProducts: products.length,
      totalSales: orders.length,
      totalGrossInr: Math.round(totalGross * 100) / 100,
      totalNetEarningsInr: Math.round(totalNet * 100) / 100,
      totalPlatformFeesInr: Math.round(totalPlatformFees * 100) / 100
    },
    products,
    recentSales: orders.slice(0, 10)
  });
});

app.post('/api/creator/products', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (req.user!.role !== 'creator' && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Creator access is required to submit a product' });
    return;
  }

  const { title, tagline, description, category, priceInr, version = '1.0.0' } = req.body;
  if (
    typeof title !== 'string' || !title.trim() || title.trim().length > 100 ||
    typeof tagline !== 'string' || !tagline.trim() || tagline.trim().length > 180 ||
    typeof description !== 'string' || !description.trim() || description.trim().length > 5000 ||
    typeof category !== 'string' || !category.trim() || category.trim().length > 60 ||
    !isValidPriceInr(typeof priceInr === 'number' ? priceInr : Number.NaN) ||
    typeof version !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9.+_-]{0,39}$/.test(version)
  ) {
    res.status(400).json({ error: 'All fields (title, tagline, description, category, priceInr) are required' });
    return;
  }

  const normalizedTitle = title.trim();
  const normalizedTagline = tagline.trim();
  const normalizedDescription = description.trim();
  const normalizedCategory = category.trim();
  const price = Number(priceInr);
  const slug = normalizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${uuidv4().slice(0, 4)}`;
  const id = `prod_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
  const downloadFilename = `${slug}_v${version}.zip`;

  db.prepare(`
    INSERT INTO products (
      id, creator_id, title, slug, tagline, description,
      category, price_inr, is_subscription, status, version,
      download_filename, file_size_kb, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending_review', ?, ?, 0, ?)
  `).run(
    id, req.user!.id, normalizedTitle, slug, normalizedTagline, normalizedDescription,
    normalizedCategory, price, version, downloadFilename, new Date().toISOString()
  );

  res.status(201).json({ success: true, productId: id, slug, status: 'pending_review', message: 'Submission saved for review. Upload and moderation are not available in this preview yet.' });
});

// -----------------------------------------------------------------------------
// 6. ADMIN CONSOLE ROUTES
// -----------------------------------------------------------------------------
app.get('/api/admin/stats', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Admin privileges required' });
    return;
  }

  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c;
  const productCount = (db.prepare('SELECT COUNT(*) as c FROM products').get() as any).c;
  const orderRows = db.prepare('SELECT * FROM orders').all() as any[];

  const totalVolume = orderRows.reduce((sum, o) => sum + o.amount_inr, 0);
  const totalCommissionRevenue = orderRows.reduce((sum, o) => sum + o.platform_fee_inr, 0);

  const commConfig = db.prepare("SELECT value FROM platform_config WHERE key = 'default_commission_rate'").get() as any;
  const commissionRate = commConfig ? parseFloat(commConfig.value) : 0.10;

  res.json({
    metrics: {
      totalUsers: userCount,
      totalProducts: productCount,
      totalOrders: orderRows.length,
      totalVolumeInr: Math.round(totalVolume * 100) / 100,
      totalCommissionRevenueInr: Math.round(totalCommissionRevenue * 100) / 100,
      currentCommissionPercent: Math.round(commissionRate * 100)
    },
    orders: orderRows.slice(-15).reverse()
  });
});

app.put('/api/admin/commission', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
  if (req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Admin privileges required' });
    return;
  }

  const { commissionRate } = req.body;
  if (commissionRate === undefined || commissionRate < 0 || commissionRate > 0.5) {
    res.status(400).json({ error: 'Commission rate must be between 0.0 (0%) and 0.50 (50%)' });
    return;
  }

  db.prepare("UPDATE platform_config SET value = ? WHERE key = 'default_commission_rate'").run(String(commissionRate));
  res.json({ success: true, updatedCommissionRate: commissionRate });
});

// Static frontend serving with SPA fallback
const DIST_PATH = path.resolve('dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('*', (req: Request, res: Response, next: NextFunction): void => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

// Server Listen
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    console.log(`[ToolForge API Server] Running on http://localhost:${PORT}`);
  });
}

export default app;
