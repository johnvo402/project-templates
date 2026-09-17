import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../../../core/api/api.routes';
import type { ApiResponse, PaginationResponse } from '../../../core/api/api.models';
import { FILTER_ENABLED, buildListUrl, type ListQuery } from '../../../core/api/list-query';
import type { CreateOrderModel, MutableOrderStatus, Order, OrderDetail, ProductOption } from '../order.models';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);

  list(query: ListQuery) { return this.get<PaginationResponse<Order>>(buildListUrl('orders', query)); }
  detail(id: string) { return this.get<OrderDetail>(API_ROUTES.orders.byId(id)); }
  activeProducts() { return this.get<PaginationResponse<ProductOption>>(FILTER_ENABLED ? buildListUrl('products', { page: 1, pageSize: 100, filters: [{ field: 'IsActive', operator: '$eq', value: true }] }) : `${API_ROUTES.products.root}?page=1&pageSize=100&isActive=true`); }
  create(model: CreateOrderModel) { return this.http.post(API_ROUTES.orders.root, model); }
  updateStatus(id: string, status: MutableOrderStatus) { return this.http.put<void>(`${API_ROUTES.orders.byId(id)}/status`, { status }); }
  cancel(id: string) { return this.http.post<void>(`${API_ROUTES.orders.byId(id)}/cancel`, {}); }

  private get<T>(url: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(url).pipe(map(response => response.results));
  }
}
