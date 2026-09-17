import { API_ROUTES } from '../../../core/api/api-routes';
import type { ApiResponse, PaginationResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import { FILTER_ENABLED, buildListUrl, type ListQuery } from '../../../core/api/list-query';
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
  list(query: ListQuery) {
    return result<PaginationResponse<Order>>(buildListUrl('orders', query));
  },
  detail(id: string) {
    return result<OrderDetail>(API_ROUTES.orders.byId(id));
  },
  activeProducts() {
    return result<PaginationResponse<ProductOption>>(FILTER_ENABLED
      ? buildListUrl('products', { page: 1, pageSize: 100, filters: [{ field: 'IsActive', operator: '$eq', value: true }] })
      : `${API_ROUTES.products.root}?page=1&pageSize=100&isActive=true`);
  },
  create(model: CreateOrderModel) {
    return customFetch<unknown>(API_ROUTES.orders.root, json('POST', model));
  },
  updateStatus(id: string, status: MutableOrderStatus) {
    return customFetch<unknown>(`${API_ROUTES.orders.byId(id)}/status`, json('PUT', { status }));
  },
  cancel(id: string) {
    return customFetch<unknown>(`${API_ROUTES.orders.byId(id)}/cancel`, { method: 'POST' });
  },
};
