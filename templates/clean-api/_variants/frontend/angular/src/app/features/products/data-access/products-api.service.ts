import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiResponse, PaginationResponse } from '../../../core/api/api.models';
import { buildListUrl, type ListQuery } from '../../../core/api/list-query';
import type { Product, ProductModel } from '../product.models';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);

  list(query: ListQuery) {
    return this.http.get<ApiResponse<PaginationResponse<Product>>>(buildListUrl('products', query)).pipe(map(response => response.results));
  }

  create(model: ProductModel) {
    return this.http.post('/api/products', model);
  }

  update(id: string, model: ProductModel) {
    return this.http.put<void>(`/api/products/${id}`, model);
  }

  remove(id: string) {
    return this.http.delete<void>(`/api/products/${id}`);
  }
}
