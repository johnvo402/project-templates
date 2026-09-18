import { API_ROUTES } from '../../../core/api/api-routes';
import type { ApiResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import type { DashboardProjection } from '../dashboard.models';

export const dashboardApi = {
  async get(): Promise<DashboardProjection> {
    return (await customFetch<ApiResponse<DashboardProjection>>(API_ROUTES.dashboard)).results;
  },
};
