const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type FetchOptions = RequestInit & { auth?: boolean };

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('learnify.accessToken');
}
function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('learnify.refreshToken');
}
export function setTokens(access: string, refresh: string) {
  localStorage.setItem('learnify.accessToken', access);
  localStorage.setItem('learnify.refreshToken', refresh);
}
export function clearTokens() {
  localStorage.removeItem('learnify.accessToken');
  localStorage.removeItem('learnify.refreshToken');
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  const rt = getRefreshToken();
  if (!rt) return false;
  refreshPromise = fetch(`${BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  })
    .then(async (r) => {
      if (!r.ok) {
        clearTokens();
        return false;
      }
      const d = await r.json();
      setTokens(d.accessToken, d.refreshToken);
      return true;
    })
    .catch(() => {
      clearTokens();
      return false;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

export async function api<T = any>(path: string, opts: FetchOptions = {}): Promise<T> {
  const headers = new Headers(opts.headers || {});
  if (!headers.has('Content-Type') && opts.body && !(opts.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (res.status === 401 && token) {
    const ok = await tryRefresh();
    if (ok) {
      const newToken = getAccessToken();
      if (newToken) headers.set('Authorization', `Bearer ${newToken}`);
      res = await fetch(`${BASE}${path}`, { ...opts, headers });
    }
  }
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const API_BASE = BASE;
