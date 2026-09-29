import { ApiError, api, resolveImage } from '../api';
import { SITE_URL } from '../config';
import { supabase } from '../supabase';

jest.mock('../supabase', () => ({
  supabase: { auth: { getSession: jest.fn() } },
}));

const getSession = supabase.auth.getSession as jest.Mock;

beforeEach(() => {
  getSession.mockReset();
  getSession.mockResolvedValue({ data: { session: null } });
});

afterEach(() => {
  jest.restoreAllMocks();
});

const mockOk = (body: string): Response =>
  ({ ok: true, status: 200, text: () => Promise.resolve(body) }) as unknown as Response;
const mockError = (body: string, status = 401): Response =>
  ({ ok: false, status, text: () => Promise.resolve(body) }) as unknown as Response;

describe('resolveImage', () => {
  it('passes absolute URLs through', () => {
    expect(resolveImage('https://cdn/img.jpg')).toBe('https://cdn/img.jpg');
  });
  it('prefixes site-relative paths', () => {
    expect(resolveImage('/logo.png')).toBe(`${SITE_URL}/logo.png`);
  });
  it('returns undefined for empty', () => {
    expect(resolveImage(undefined)).toBeUndefined();
    expect(resolveImage(null)).toBeUndefined();
  });
});

describe('api client', () => {
  it('catalog hits /api/catalog', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockOk('{"categories":[],"products":[]}'));
    const res = await api.catalog();
    expect(res).toEqual({ categories: [], products: [] });
    const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${SITE_URL}/api/catalog`);
    expect(init.headers).toBeInstanceOf(Headers);
  });

  it('attaches Bearer token when logged in', async () => {
    getSession.mockResolvedValue({
      data: { session: { access_token: 'tok-123' } },
    });
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockOk('{"orders":[]}'));
    await api.myOrders();
    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect((init.headers as Headers).get('authorization')).toBe('Bearer tok-123');
  });

  it('throws ApiError with server message', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(mockError('{"error":"Sign in required"}', 401));
    await expect(api.myOrders()).rejects.toMatchObject({
      status: 401,
      message: 'Sign in required',
    });
  });

  it('throws ApiError status 0 when offline', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('net down'));
    await expect(api.catalog()).rejects.toBeInstanceOf(ApiError);
    await expect(api.catalog()).rejects.toMatchObject({ status: 0 });
  });

  it('quote posts cart lines', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockOk('{"items":[],"itemCount":0,"subtotal":0,"deliveryCharge":0,"total":0}'),
    );
    await api.quote([{ productId: 'prod-1', quantity: 2 }]);
    const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(`${SITE_URL}/api/quote`);
    expect(JSON.parse(init.body).items).toEqual([{ productId: 'prod-1', quantity: 2 }]);
  });
});
