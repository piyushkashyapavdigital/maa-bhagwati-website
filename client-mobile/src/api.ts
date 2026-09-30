import { SITE_URL } from './config';
import { supabase } from './supabase';
import type {
  AddressForm,
  CartQuote,
  Category,
  Order,
  Product,
  QuoteLine,
} from './types';

export interface Banner {
  id: string;
  image: string;
  title?: string;
  link?: string;
  placement?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Maps a stored image path to a loadable URI. */
export function resolveImage(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${SITE_URL}${path}`;
  return path;
}

async function authHeaders(): Promise<Headers> {
  const headers = new Headers();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) headers.set('authorization', `Bearer ${token}`);
  return headers;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  if (init.headers) {
    new Headers(init.headers).forEach((v, k) => headers.set(k, v));
  }
  const isForm = init.body instanceof FormData;
  if (init.body && !isForm && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(`${SITE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      `Cannot reach the shop server. Check your internet connection.`,
      0,
    );
  }

  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }
  if (!res.ok) {
    const msg =
      (data as { error?: string }).error || `Request failed (HTTP ${res.status})`;
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

export const api = {
  catalog: () =>
    request<{ categories: Category[]; products: Product[] }>('/api/catalog'),
  quote: (items: QuoteLine[]) =>
    request<CartQuote>('/api/quote', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
  createRzpOrder: (customer: AddressForm, items: QuoteLine[]) =>
    request<{ id: string; amount: number; currency: string; quote: CartQuote }>(
      '/api/client/create-order',
      { method: 'POST', body: JSON.stringify({ customer, items }) },
    ),
  verifyPayment: (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    items: QuoteLine[];
  }) =>
    request<{ success: boolean; paymentId: string; orderId: string }>(
      '/api/razorpay/verify',
      { method: 'POST', body: JSON.stringify(payload) },
    ),
  myOrders: () => request<{ orders: Order[] }>('/api/client/orders'),
  banners: () => request<{ banners: Banner[] }>('/api/client/banners'),
  contact: (body: { name: string; phone: string; message: string }) =>
    request<{ success: boolean }>('/api/client/contact', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
