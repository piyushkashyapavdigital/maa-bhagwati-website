import { ApiError } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

// `ma` and api.ts's internal AsyncStorage share the same instance
// because the module is loaded once (no jest.resetModules).
const ma = AsyncStorage as unknown as {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
};

let api: typeof import('../api');

beforeAll(() => {
  api = require('../api');
});

beforeEach(() => {
  ma.getItem.mockReset();
  ma.setItem.mockReset();
  ma.removeItem.mockReset();
  // Reset module-level mutable state via public setters.
  api.setApiBase(api.DEFAULT_API_URL);
  api.setSiteBase(api.DEFAULT_SITE_URL);
  api.setToken('');
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ApiError', () => {
  it('stores message and status', () => {
    const e = new ApiError('Unauthorized', 401);
    expect(e.message).toBe('Unauthorized');
    expect(e.status).toBe(401);
    expect(e.name).toBe('ApiError');
  });
  it('works with zero status (network down)', () => {
    const e = new ApiError('Cannot reach server at http://x.', 0);
    expect(e.status).toBe(0);
  });
});

describe('api module', () => {
  it('exports defaults', () => {
    expect(api.DEFAULT_API_URL).toBe('http://192.168.1.34:8787');
    expect(api.DEFAULT_SITE_URL).toBe('http://192.168.1.34:3000');
    expect(api.getApiBase()).toBe('http://192.168.1.34:8787');
    expect(api.getSiteBase()).toBe('http://192.168.1.34:3000');
    expect(api.getToken()).toBe('');
  });

  it('setApiBase stores and trims', () => {
    api.setApiBase('  http://10.0.0.5:9000///  ');
    expect(api.getApiBase()).toBe('http://10.0.0.5:9000');
    expect(ma.setItem).toHaveBeenCalled();
  });

  it('setSiteBase stores', () => {
    api.setSiteBase('http://site:4000');
    expect(api.getSiteBase()).toBe('http://site:4000');
    expect(ma.setItem).toHaveBeenCalled();
  });

  it('setToken stores', () => {
    api.setToken('abc123');
    expect(api.getToken()).toBe('abc123');
    expect(ma.setItem).toHaveBeenCalled();
  });

  it('setToken removes when empty', () => {
    api.setToken('');
    expect(ma.removeItem).toHaveBeenCalled();
  });

  it('initApi reads all three from AsyncStorage', async () => {
    ma.getItem.mockResolvedValueOnce('http://api:7777')
      .mockResolvedValueOnce('http://site:4444')
      .mockResolvedValueOnce('tok-999');
    await api.initApi();
    expect(api.getApiBase()).toBe('http://api:7777');
    expect(api.getSiteBase()).toBe('http://site:4444');
    expect(api.getToken()).toBe('tok-999');
  });

  it('initApi treats missing token as empty string', async () => {
    ma.getItem.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    await api.initApi();
    expect(api.getToken()).toBe('');
  });

  it('resolveImage handles absolute URLs', () => {
    expect(api.resolveImage('https://cdn/img.jpg')).toBe('https://cdn/img.jpg');
  });
  it('resolveImage maps /images/uploads/ to api base', () => {
    expect(api.resolveImage('/images/uploads/abc.png')).toBe(
      'http://192.168.1.34:8787/uploads/abc.png'
    );
  });
  it('resolveImage maps plain paths to site base', () => {
    expect(api.resolveImage('/logo.png')).toBe('http://192.168.1.34:3000/logo.png');
  });
  it('resolveImage returns undefined for empty', () => {
    expect(api.resolveImage(undefined)).toBeUndefined();
    expect(api.resolveImage(null)).toBeUndefined();
  });
  it('resolveImage passes through relative paths', () => {
    expect(api.resolveImage('local.png')).toBe('local.png');
  });

  const mockOk = (body: string, status = 200): Response => ({
    ok: true,
    status,
    text: () => Promise.resolve(body),
  } as unknown as Response);
  const mockError = (body: string, status = 401): Response => ({
    ok: false,
    status,
    text: () => Promise.resolve(body),
  } as unknown as Response);

  it('request resolves data on 200', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockOk('{"ok":true}'));
    const data = await api.api.get<{ ok: boolean }>('/api/test');
    expect(data).toEqual({ ok: true });
  });

  it('request throws ApiError on non-ok', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockError('{"error":"Invalid token"}', 401));
    await expect(api.api.get('/api/test')).rejects.toThrow(ApiError);
    await expect(api.api.get('/api/test')).rejects.toMatchObject({ status: 401 });
  });

  it('request throws ApiError on empty error text', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockError('', 500));
    await expect(api.api.get('/api/test')).rejects.toMatchObject({ status: 500 });
  });

  it('request throws ApiError status 0 on network failure', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('net down'));
    await expect(api.api.get('/api/test')).rejects.toMatchObject({ status: 0 });
  });

  it('request includes x-admin-token when set', async () => {
    api.setToken('secret');
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockOk('{}'));
    await api.api.get('/api/test');
    const calls = (globalThis.fetch as jest.Mock).mock.calls;
    expect(calls[0][1].headers.get('x-admin-token')).toBe('secret');
  });

  it('api object exposes get/post/put/patch/del/upload', () => {
    expect(typeof api.api.get).toBe('function');
    expect(typeof api.api.post).toBe('function');
    expect(typeof api.api.put).toBe('function');
    expect(typeof api.api.patch).toBe('function');
    expect(typeof api.api.del).toBe('function');
    expect(typeof api.api.upload).toBe('function');
  });
});
