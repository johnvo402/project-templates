import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API_ROUTES } from '../../../core/api/api.routes';
import type { ApiResponse } from '../../../core/api/api.models';
import type { DashboardProjection } from '../dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  get() { return this.http.get<ApiResponse<DashboardProjection>>(API_ROUTES.dashboard).pipe(map(response => response.results)); }
}
