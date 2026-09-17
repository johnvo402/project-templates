import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiResponse, PaginationResponse } from '../../../core/api/api.models';
import { buildBusinessListUrl, type BusinessListQuery } from '../../../shared/query/business-query';
import type { Product, ProductModel } from '../product.models';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);

  list(query: BusinessListQuery) {
    return this.http.get<ApiResponse<PaginationResponse<Product>>>(buildBusinessListUrl('products', query)).pipe(map(response => response.results));
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
