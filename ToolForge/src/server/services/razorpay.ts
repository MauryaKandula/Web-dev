import crypto from 'node:crypto';

export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status?: string;
  receipt?: string;
}

export interface RazorpayPayment {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  captured: boolean;
}

type Fetcher = typeof fetch;

export function getRazorpayCredentials(
  env: NodeJS.ProcessEnv = process.env
): RazorpayCredentials | null {
  const keyId = env.RAZORPAY_KEY_ID?.trim();
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret || !/^rzp_(test|live)_[A-Za-z0-9]+$/.test(keyId)) {
    return null;
  }

  return { keyId, keySecret };
}

function authorizationHeader(credentials: RazorpayCredentials): string {
  return 'Basic ' + Buffer.from(credentials.keyId + ':' + credentials.keySecret).toString('base64');
}

async function razorpayRequest<T>(
  endpoint: string,
  credentials: RazorpayCredentials,
  init: RequestInit,
  fetcher: Fetcher
): Promise<T> {
  const response = await fetcher('https://api.razorpay.com/v1/' + endpoint, {
    ...init,
    headers: {
      Authorization: authorizationHeader(credentials),
      'Content-Type': 'application/json',
      ...init.headers
    },
    signal: AbortSignal.timeout(12_000)
  });

  if (!response.ok) {
    // Do not return upstream error bodies; they can include merchant or customer details.
    throw new Error('Razorpay API request failed with status ' + response.status);
  }

  return await response.json() as T;
}

export async function createRazorpayOrder(
  input: {
    amountPaise: number;
    receipt: string;
    notes: Record<string, string>;
  },
  credentials: RazorpayCredentials,
  fetcher: Fetcher = fetch
): Promise<RazorpayOrder> {
  if (!Number.isSafeInteger(input.amountPaise) || input.amountPaise < 100) {
    throw new Error('Razorpay orders must have an integer amount of at least 100 paise');
  }

  const order = await razorpayRequest<RazorpayOrder>(
    'orders',
    credentials,
    {
      method: 'POST',
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: 'INR',
        receipt: input.receipt,
        notes: input.notes
      })
    },
    fetcher
  );

  if (
    typeof order.id !== 'string' ||
    !/^order_[A-Za-z0-9]+$/.test(order.id) ||
    order.amount !== input.amountPaise ||
    order.currency !== 'INR'
  ) {
    throw new Error('Razorpay returned an order that does not match the requested amount and currency');
  }

  return order;
}

export async function fetchRazorpayPayment(
  paymentId: string,
  credentials: RazorpayCredentials,
  fetcher: Fetcher = fetch
): Promise<RazorpayPayment> {
  if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
    throw new Error('Invalid Razorpay payment id');
  }

  const payment = await razorpayRequest<RazorpayPayment>(
    'payments/' + encodeURIComponent(paymentId),
    credentials,
    { method: 'GET' },
    fetcher
  );

  if (payment.id !== paymentId) {
    throw new Error('Razorpay returned a different payment id');
  }

  return payment;
}

function hasValidHmac(
  message: string | Buffer,
  suppliedSignature: string,
  secret: string
): boolean {
  if (!/^[a-f0-9]{64}$/i.test(suppliedSignature)) return false;

  const expected = crypto.createHmac('sha256', secret).update(message).digest();
  const supplied = Buffer.from(suppliedSignature, 'hex');
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string
): boolean {
  if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
    return false;
  }

  return hasValidHmac(orderId + '|' + paymentId, signature, keySecret);
}

export function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string,
  webhookSecret: string
): boolean {
  return hasValidHmac(rawBody, signature, webhookSecret);
}
