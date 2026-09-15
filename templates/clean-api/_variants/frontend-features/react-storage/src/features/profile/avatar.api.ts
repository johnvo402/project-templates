import { API_ROUTES } from '../../core/api/api-routes';
import type { ApiResponse } from '../../core/api/api-types';
import { customFetch } from '../../core/api/custom-fetch';

type AvatarProjection = { url: string };

export const avatarApi = {
  async get(): Promise<string | null> {
    try { return (await customFetch<ApiResponse<AvatarProjection>>(API_ROUTES.profile.avatar)).results.url; }
    catch { return null; }
  },
  async upload(file: File): Promise<string> {
    const form = new FormData(); form.append('file', file);
    return (await customFetch<ApiResponse<AvatarProjection>>(API_ROUTES.profile.avatar, { method: 'POST', body: form })).results.url;
  },
};
