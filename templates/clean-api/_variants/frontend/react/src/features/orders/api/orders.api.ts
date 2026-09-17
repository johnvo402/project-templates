import type { ApiResponse, PaginationResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import { buildActiveProductsUrl, buildBusinessListUrl, type BusinessListQuery } from '../../../shared/query/business-query';
import type { CreateOrderModel, MutableOrderStatus, Order, OrderDetail, ProductOption } from '../order.models';

async function result<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await customFetch<ApiResponse<T>>(path, options);
  return response.results;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const ordersApi = {
  list(query: BusinessListQuery) {
    return result<PaginationResponse<Order>>(buildBusinessListUrl('orders', query));
  },
  detail(id: string) {
    return result<OrderDetail>(`/api/orders/${id}`);
  },
  activeProducts() {
    return result<PaginationResponse<ProductOption>>(buildActiveProductsUrl());
  },
  create(model: CreateOrderModel) {
    return customFetch<unknown>('/api/orders', json('POST', model));
  },
  updateStatus(id: string, status: MutableOrderStatus) {
    return customFetch<unknown>(`/api/orders/${id}/status`, json('PUT', { status }));
  },
  cancel(id: string) {
    return customFetch<unknown>(`/api/orders/${id}/cancel`, { method: 'POST' });
  },
};
