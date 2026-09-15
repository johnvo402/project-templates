import { API_ROUTES } from '../../core/api/api-routes';
import type { ApiResponse } from '../../core/api/api-types';
import { customFetch } from '../../core/api/custom-fetch';
import type { UserProfile } from './profile.models';

export const profileApi = {
  async get(): Promise<UserProfile> {
    return (await customFetch<ApiResponse<UserProfile>>(API_ROUTES.profile.root)).results;
  },
  async update(displayName: string, bio: string): Promise<void> {
    await customFetch<void>(API_ROUTES.profile.root, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, bio: bio.trim() || null }),
    });
  },
};
