import { API_ROUTES } from '../../../core/api/api-routes';
import type { ApiResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import type { OrderStatusReport, TopProductReport } from '../report.models';

async function result<T>(path: string): Promise<T> {
  return (await customFetch<ApiResponse<T>>(path)).results;
}

export const reportsApi = {
  topProducts: () => result<TopProductReport[]>(`${API_ROUTES.reports.topProducts}?take=10`),
  ordersByStatus: () => result<OrderStatusReport[]>(API_ROUTES.reports.ordersByStatus),
};
