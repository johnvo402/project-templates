import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { ApiResponse, PaginationResponse } from '../../../core/api/api.models';
import { buildActiveProductsUrl, buildBusinessListUrl, type BusinessListQuery } from '../../../query/business-query';
import type { CreateOrderModel, MutableOrderStatus, Order, OrderDetail, ProductOption } from '../order.models';

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  private readonly http = inject(HttpClient);

  list(query: BusinessListQuery) { return this.get<PaginationResponse<Order>>(buildBusinessListUrl('orders', query)); }
  detail(id: string) { return this.get<OrderDetail>(`/api/orders/${id}`); }
  activeProducts() { return this.get<PaginationResponse<ProductOption>>(buildActiveProductsUrl()); }
  create(model: CreateOrderModel) { return this.http.post('/api/orders', model); }
  updateStatus(id: string, status: MutableOrderStatus) { return this.http.put<void>(`/api/orders/${id}/status`, { status }); }
  cancel(id: string) { return this.http.post<void>(`/api/orders/${id}/cancel`, {}); }

  private get<T>(url: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(url).pipe(map(response => response.results));
  }
}
