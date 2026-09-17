import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import type { ApiResponse } from '../../../core/api/api.models';
import type { OrderStatusReport, TopProductReport } from '../report.models';

@Injectable({ providedIn:'root' })
export class ReportsApiService { private readonly http=inject(HttpClient); topProducts(){return this.http.get<ApiResponse<TopProductReport[]>>('/api/reports/top-products?take=10').pipe(map(x=>x.results));} ordersByStatus(){return this.http.get<ApiResponse<OrderStatusReport[]>>('/api/reports/orders-by-status').pipe(map(x=>x.results));} }
