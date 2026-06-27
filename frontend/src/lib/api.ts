// Thin fetch wrapper for the Laravel API.
//
// Cross-origin setup: Directs requests directly to the live Render backend.

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'https://soppingly-componential-elia.ngrok-free.dev/api';
const TOKEN_KEY = 'kemi_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public payload?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

type Options = {
  method?: string;
  body?: unknown;
  formData?: FormData;
  headers?: Record<string, string>;
};

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers ?? {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // If BASE already ends with /api, don't double-prefix
  const baseHasApi = /\/api$/.test(BASE);
  const urlPath = baseHasApi || cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;
  const targetUrl = `${BASE}${urlPath}`;

  const res = await fetch(targetUrl, {
    method: opts.method ?? (body ? 'POST' : 'GET'),
    headers,
    body,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && String((payload as any).message)) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, message, payload);
  }

  return payload as T;
}

export const apiBaseUrl = BASE; 
