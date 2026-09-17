import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API_ROUTES } from '../../../core/api/api.routes';
import type { ApiResponse } from '../../../core/api/api.models';
import type { OrderStatusReport, TopProductReport } from '../report.models';

@Injectable({ providedIn:'root' })
export class ReportsApiService {
  private readonly http=inject(HttpClient);
  topProducts(){return this.http.get<ApiResponse<TopProductReport[]>>(`${API_ROUTES.reports.topProducts}?take=10`).pipe(map(x=>x.results));}
  ordersByStatus(){return this.http.get<ApiResponse<OrderStatusReport[]>>(API_ROUTES.reports.ordersByStatus).pipe(map(x=>x.results));}
}
