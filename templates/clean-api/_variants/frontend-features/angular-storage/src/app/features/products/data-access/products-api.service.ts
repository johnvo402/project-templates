import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API_ROUTES } from '../../../core/api/api.routes';
import { ApiResponse, PaginationResponse } from '../../../core/api/api.models';
import { buildListUrl, type ListQuery } from '../../../core/api/list-query';
import type { Product, ProductModel } from '../product.models';

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);

  list(query: ListQuery) {
    return this.http.get<ApiResponse<PaginationResponse<Product>>>(buildListUrl('products', query)).pipe(map(response => response.results));
  }

  create(model: ProductModel, image: File | null = null) {
    return this.http.post(API_ROUTES.products.root, this.toFormData(model, image));
  }

  update(id: string, model: ProductModel, image: File | null = null) {
    return this.http.put<void>(API_ROUTES.products.byId(id), this.toFormData(model, image));
  }

  remove(id: string) {
    return this.http.delete<void>(API_ROUTES.products.byId(id));
  }

  private toFormData(model: ProductModel, image: File | null) {
    const body = new FormData();
    body.set('name', model.name);
    body.set('sku', model.sku);
    body.set('price', String(model.price));
    body.set('stockQuantity', String(model.stockQuantity));
    body.set('isActive', String(model.isActive));
    if (image) body.set('image', image);
    return body;
  }
}
