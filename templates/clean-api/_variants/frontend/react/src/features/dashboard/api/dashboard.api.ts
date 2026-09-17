import type { ApiResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import type { DashboardProjection } from '../dashboard.models';

export const dashboardApi = {
  async get(): Promise<DashboardProjection> {
    return (await customFetch<ApiResponse<DashboardProjection>>('/api/dashboard')).results;
  },
};
