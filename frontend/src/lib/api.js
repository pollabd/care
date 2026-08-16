export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

let runtimeApiUrl = null;

async function resolveApiUrl() {
  if (runtimeApiUrl) {
    return runtimeApiUrl;
  }
  try {
    const res = await fetch('/api/config', { cache: 'no-store' });
    const data = await res.json();
    runtimeApiUrl = data.apiUrl || API_URL;
  } catch (err) {
    runtimeApiUrl = API_URL;
  }
  return runtimeApiUrl;
}

export function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem('token');
}

export function getUser() {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem('user');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export async function api(path, options = {}) {
  const base = await resolveApiUrl();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${base}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    throw err;
  }
  return data;
}
