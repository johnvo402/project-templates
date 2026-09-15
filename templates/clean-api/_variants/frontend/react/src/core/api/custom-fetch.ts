import { accessTokenStore } from '../auth/access-token';
import { refreshAccessToken } from '../auth/auth-session';

const authPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
const shouldAttemptRefresh = (url: string) => !authPaths.some(path => url.includes(path));

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => undefined) as unknown;
  if (!response.ok) throw body ?? new Error(`HTTP ${response.status}`);
  return body as T;
}

export const customFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const execute = () => {
    const headers = new Headers(options.headers);
    const token = accessTokenStore.get();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, { ...options, headers, credentials: 'include' });
  };

  let response = await execute();
  if (response.status === 401 && shouldAttemptRefresh(url)) {
    const user = await refreshAccessToken();
    if (user) response = await execute();
  }
  return parseResponse<T>(response);
};

export type ErrorType<Error> = Error;
export type BodyType<BodyData> = BodyData;
