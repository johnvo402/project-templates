import type { ApiResponse, PaginationResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import { buildBusinessListUrl, type BusinessListQuery } from '../../../shared/query/business-query';
import type { Product, ProductModel } from '../product.models';

async function result<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await customFetch<ApiResponse<T>>(path, options);
  return response.results;
}

function toFormData(model: ProductModel, image: File | null) {
  const body = new FormData();
  body.set('name', model.name);
  body.set('sku', model.sku);
  body.set('price', String(model.price));
  body.set('stockQuantity', String(model.stockQuantity));
  body.set('isActive', String(model.isActive));
  if (image) body.set('image', image);
  return body;
}

export const productsApi = {
  list(query: BusinessListQuery) {
    return result<PaginationResponse<Product>>(buildBusinessListUrl('products', query));
  },
  create(model: ProductModel, image: File | null = null) {
    return customFetch<unknown>('/api/products', { method: 'POST', body: toFormData(model, image) });
  },
  update(id: string, model: ProductModel, image: File | null = null) {
    return customFetch<unknown>(`/api/products/${id}`, { method: 'PUT', body: toFormData(model, image) });
  },
  remove(id: string) {
    return customFetch<unknown>(`/api/products/${id}`, { method: 'DELETE' });
  },
};
