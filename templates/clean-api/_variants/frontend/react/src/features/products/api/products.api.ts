import type { ApiResponse, PaginationResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import { buildBusinessListUrl, type BusinessListQuery } from '../../business/business-query';
import type { Product, ProductModel } from '../product.models';

async function result<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await customFetch<ApiResponse<T>>(path, options);
  return response.results;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const productsApi = {
  list(query: BusinessListQuery) {
    return result<PaginationResponse<Product>>(buildBusinessListUrl('products', query));
  },
  create(model: ProductModel) {
    return customFetch<unknown>('/api/products', json('POST', model));
  },
  update(id: string, model: ProductModel) {
    return customFetch<unknown>(`/api/products/${id}`, json('PUT', model));
  },
  remove(id: string) {
    return customFetch<unknown>(`/api/products/${id}`, { method: 'DELETE' });
  },
};
