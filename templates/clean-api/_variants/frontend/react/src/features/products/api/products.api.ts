import { API_ROUTES } from '../../../core/api/api-routes';
import type { ApiResponse, PaginationResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import { buildListUrl, type ListQuery } from '../../../core/api/list-query';
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
  list(query: ListQuery) {
    return result<PaginationResponse<Product>>(buildListUrl('products', query));
  },
  create(model: ProductModel) {
    return customFetch<unknown>(API_ROUTES.products.root, json('POST', model));
  },
  update(id: string, model: ProductModel) {
    return customFetch<unknown>(API_ROUTES.products.byId(id), json('PUT', model));
  },
  remove(id: string) {
    return customFetch<unknown>(API_ROUTES.products.byId(id), { method: 'DELETE' });
  },
};
