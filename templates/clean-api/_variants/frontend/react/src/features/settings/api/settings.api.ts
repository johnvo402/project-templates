import type { ApiResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import type { StoreSettings } from '../settings.models';

export const settingsApi = {
  async get(): Promise<StoreSettings> {
    return (await customFetch<ApiResponse<StoreSettings>>('/api/settings')).results;
  },
  async update(model: StoreSettings): Promise<void> {
    await customFetch<void>('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(model),
    });
  },
};
