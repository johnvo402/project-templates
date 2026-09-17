import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { ApiResponse, PaginationResponse } from '../../../core/api/api.models';
import { FILTER_ENABLED, buildListUrl, type ListQuery } from '../../../core/api/list-query';
import type { CreateOrderModel, MutableOrderStatus, Order, OrderDetail, ProductOption } from '../order.models';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);

  list(query: ListQuery) { return this.get<PaginationResponse<Order>>(buildListUrl('orders', query)); }
  detail(id: string) { return this.get<OrderDetail>(`/api/orders/${id}`); }
  activeProducts() { return this.get<PaginationResponse<ProductOption>>((FILTER_ENABLED ? buildListUrl('products', { page: 1, pageSize: 100, filters: [{ field: 'IsActive', operator: '$eq', value: true }] }) : '/api/products?page=1&pageSize=100&isActive=true')); }
  create(model: CreateOrderModel) { return this.http.post('/api/orders', model); }
  updateStatus(id: string, status: MutableOrderStatus) { return this.http.put<void>(`/api/orders/${id}/status`, { status }); }
  cancel(id: string) { return this.http.post<void>(`/api/orders/${id}/cancel`, {}); }

  private get<T>(url: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(url).pipe(map(response => response.results));
  }
}
