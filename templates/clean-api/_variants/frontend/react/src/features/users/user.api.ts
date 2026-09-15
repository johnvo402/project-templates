import { API_ROUTES } from '../../core/api/api-routes';
import type { ApiResponse } from '../../core/api/api-types';
import { customFetch } from '../../core/api/custom-fetch';
import type { UserSummary } from './user.models';

export const userApi = {
  async list(): Promise<UserSummary[]> {
    return (await customFetch<ApiResponse<UserSummary[]>>(API_ROUTES.users.root)).results;
  },
  async changeRole(id: string, role: string): Promise<void> {
    await customFetch<ApiResponse<unknown>>(API_ROUTES.users.role(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
  },
};
