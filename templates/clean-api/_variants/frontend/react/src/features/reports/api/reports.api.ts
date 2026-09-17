import type { ApiResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import type { OrderStatusReport, TopProductReport } from '../report.models';

async function result<T>(path: string): Promise<T> {
  return (await customFetch<ApiResponse<T>>(path)).results;
}

export const reportsApi = {
  topProducts: () => result<TopProductReport[]>('/api/reports/top-products?take=10'),
  ordersByStatus: () => result<OrderStatusReport[]>('/api/reports/orders-by-status'),
};
