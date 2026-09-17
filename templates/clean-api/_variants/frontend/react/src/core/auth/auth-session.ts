import { API_ROUTES } from '../api/api-routes';
import type { ApiResponse } from '../api/api-types';
import { configureCurrency } from '../../utils/formatters';
import { accessTokenStore } from './access-token';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
};

type AuthTokenResponse = {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  user: AuthUser;
};

type DisplaySettingsResponse = {
  currency: string;
  timezone: string;
};

let refreshPromise: Promise<AuthUser | null> | null = null;

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw body;
  return body as T;
}

function messageOf(error: unknown): string {
  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    if (typeof record.detail === 'string') return record.detail;
    if (typeof record.title === 'string') return record.title;
    if (typeof record.message === 'string') return record.message;
  }
  return 'Request failed.';
}

async function loadDisplaySettings(): Promise<void> {
  const token = accessTokenStore.get();
  if (!token) return;

  try {
    const response = await fetch(API_ROUTES.settingsDisplay, {
      credentials: 'include',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;

    const envelope = await response.json() as ApiResponse<DisplaySettingsResponse>;
    configureCurrency(envelope.results.currency);
  } catch {
    // Formatting falls back to the template's VND default if preferences cannot be loaded.
  }
}

async function authenticate(
  path: string,
  payload: { email: string; password: string; displayName?: string },
): Promise<AuthUser> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  try {
    const envelope = await readJson<ApiResponse<AuthTokenResponse>>(response);
    accessTokenStore.set(envelope.results.accessToken);
    await loadDisplaySettings();
    return envelope.results.user;
  } catch (error) {
    throw new Error(messageOf(error));
  }
}

export const login = (email: string, password: string) =>
  authenticate(API_ROUTES.auth.login, { email, password });

export const register = (email: string, password: string, displayName: string) =>
  authenticate(API_ROUTES.auth.register, { email, password, displayName });

export function refreshAccessToken(): Promise<AuthUser | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const response = await fetch(API_ROUTES.auth.refresh, { method: 'POST', credentials: 'include' });
    if (!response.ok) {
      accessTokenStore.clear();
      configureCurrency('VND');
      return null;
    }
    const envelope = await response.json() as ApiResponse<AuthTokenResponse>;
    accessTokenStore.set(envelope.results.accessToken);
    await loadDisplaySettings();
    return envelope.results.user;
  })().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function logout(): Promise<void> {
  try { await fetch(API_ROUTES.auth.logout, { method: 'POST', credentials: 'include' }); }
  finally {
    accessTokenStore.clear();
    configureCurrency('VND');
  }
}

export function bootstrapAuth(): Promise<AuthUser | null> { return refreshAccessToken(); }
export function can(user: AuthUser, permission: string): boolean { return user.permissions.includes(permission); }
