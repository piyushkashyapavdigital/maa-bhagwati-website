import AsyncStorage from '@react-native-async-storage/async-storage';

const K_API_URL = 'mbpb_api_url';
const K_SITE_URL = 'mbpb_site_url';
const K_TOKEN = 'mbpb_admin_token';

export const DEFAULT_API_URL = 'https://maa-bhagwati.vercel.app';
export const DEFAULT_SITE_URL = 'https://maa-bhagwati.vercel.app';

let apiBase = DEFAULT_API_URL;
let siteBase = DEFAULT_SITE_URL;
let token = '';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getApiBase(): string {
  return apiBase;
}

export function getSiteBase(): string {
  return siteBase;
}

export function getToken(): string {
  return token;
}

const trimSlash = (u: string) => u.trim().replace(/\/+$/, '');

export async function initApi(): Promise<void> {
  const [url, site, t] = await Promise.all([
    AsyncStorage.getItem(K_API_URL),
    AsyncStorage.getItem(K_SITE_URL),
    AsyncStorage.getItem(K_TOKEN),
  ]);
  if (url) apiBase = trimSlash(url);
  if (site) siteBase = trimSlash(site);
  token = t ?? '';
}

export async function setApiBase(url: string): Promise<void> {
  apiBase = trimSlash(url) || DEFAULT_API_URL;
  await AsyncStorage.setItem(K_API_URL, apiBase);
}

export async function setSiteBase(url: string): Promise<void> {
  siteBase = trimSlash(url) || DEFAULT_SITE_URL;
  await AsyncStorage.setItem(K_SITE_URL, siteBase);
}

export async function setToken(t: string): Promise<void> {
  token = t;
  if (t) await AsyncStorage.setItem(K_TOKEN, t);
  else await AsyncStorage.removeItem(K_TOKEN);
}

/** Maps a stored image path to a URI the device can load. */
export function resolveImage(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/images/uploads/')) {
    return `${apiBase}/api/upload/${path.slice('/images/uploads/'.length)}`;
  }
  if (path.startsWith('/')) return `${siteBase}${path}`;
  return path;
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set('x-admin-token', token);
  const isForm = init.body instanceof FormData;
  if (init.body && !isForm && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      `Cannot reach server at ${apiBase}. Start it with \`bun run dev\` in mobile/api and run \`adb reverse tcp:8787 tcp:8787\`.`,
      0
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
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, file: { uri: string; name: string; type: string }) => {
    const fd = new FormData();
    fd.append('file', file as unknown as Blob);
    return request<T>(path, { method: 'POST', body: fd });
  },
};

export type ImageFile = { uri: string; name: string; type: string };
