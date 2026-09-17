import type { ApiResponse } from '../../core/api/api-types';
import { customFetch } from '../../core/api/custom-fetch';

export type ProductImage = {
  id: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
};

export const productImagesApi = {
  async list(productId: string): Promise<ProductImage[]> {
    return (await customFetch<ApiResponse<ProductImage[]>>(`/api/products/${productId}/images`)).results;
  },
  async upload(productId: string, file: File): Promise<ProductImage> {
    const form = new FormData();
    form.append('file', file);
    return (await customFetch<ApiResponse<ProductImage>>(`/api/products/${productId}/images`, { method: 'POST', body: form })).results;
  },
  async remove(productId: string, imageId: string): Promise<void> {
    await customFetch<void>(`/api/products/${productId}/images/${imageId}`, { method: 'DELETE' });
  },
  async setPrimary(productId: string, imageId: string): Promise<void> {
    await customFetch<void>(`/api/products/${productId}/images/${imageId}/primary`, { method: 'PUT' });
  },
};
