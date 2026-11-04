import { User, Product, LibraryItem, Review } from '../types.ts';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('tf_token');
}

export function setAuthToken(token: string | null): void {
  if (token) localStorage.setItem('tf_token', token);
  else localStorage.removeItem('tf_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Auth
  login: (email: string, password: string) => request<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  demoSwitch: (role: 'customer' | 'creator' | 'admin') => request<{ user: User; token: string }>('/auth/demo-switch', {
    method: 'POST',
    body: JSON.stringify({ role })
  }),
  getMe: () => request<{ user: User }>('/auth/me'),

  // Products
  getProducts: async (params?: { category?: string; search?: string; maxPrice?: number; sort?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.search) query.append('search', params.search);
      if (params?.maxPrice) query.append('maxPrice', String(params.maxPrice));
      if (params?.sort) query.append('sort', params.sort);
      return await request<{ products: Product[] }>(`/products?${query.toString()}`);
    } catch {
      return { products: [] };
    }
  },
  getProductBySlug: (slug: string) => request<{ product: Product; reviews: Review[] }>(`/products/${slug}`),
  addReview: (productId: string, rating: number, comment: string) => request<{ success: boolean; reviewId: string }>(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment })
  }),

  // Orders & Library
  checkout: (productId: string, paymentMethod: string, idempotencyKey?: string) => request<{
    success: boolean;
    orderId: string;
    transactionId: string;
    licenseKey: string;
    productTitle: string;
    amountInr: number;
  }>('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({ productId, paymentMethod, idempotencyKey })
  }),
  createRazorpayOrder: (productId: string) => request<{
    success: boolean;
    orderId: string;
    amountPaise: number;
    currency: string;
    productId: string;
    productTitle: string;
    priceInr: number;
    keyId: string;
    notes: {
      userId: string;
      productId: string;
      orderId: string;
    };
  }>('/payment/create-order', {
    method: 'POST',
    body: JSON.stringify({ productId })
  }),
  verifyRazorpayPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => request<{
    success: boolean;
    orderId: string;
    transactionId: string;
    licenseKey: string;
    productTitle: string;
  }>('/payment/verify-payment', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getLibrary: () => request<{ library: LibraryItem[] }>('/orders/library'),
  getWishlist: () => request<{ wishlist: Product[] }>('/orders/wishlist'),
  toggleWishlist: (productId: string) => request<{ inWishlist: boolean }>('/orders/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId })
  }),
  downloadSoftwareUrl: (productId: string) => `${API_BASE}/orders/download/${productId}`,

  // Creator
  getCreatorStats: () => request<{
    stats: {
      totalProducts: number;
      totalSales: number;
      totalGrossInr: number;
      totalNetEarningsInr: number;
      totalPlatformFeesInr: number;
    };
    products: Product[];
    recentSales: any[];
  }>('/creator/stats'),
  createProduct: (data: any) => request<{ success: boolean; productId: string; slug: string }>('/creator/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Admin
  getAdminStats: () => request<{
    metrics: {
      totalUsers: number;
      totalProducts: number;
      totalOrders: number;
      totalVolumeInr: number;
      totalCommissionRevenueInr: number;
      currentCommissionPercent: number;
    };
    orders: any[];
  }>('/admin/stats'),
  updateCommission: (commissionRate: number) => request<{ success: boolean; updatedCommissionRate: number }>('/admin/commission', {
    method: 'PUT',
    body: JSON.stringify({ commissionRate })
  })
};
