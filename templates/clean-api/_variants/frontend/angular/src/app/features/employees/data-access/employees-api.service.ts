import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import type { ApiResponse, PaginationResponse } from '../../../core/api/api.models';
import { buildBusinessListUrl, type BusinessListQuery } from '../../../shared/query/business-query';
import type { CreateEmployeeModel, Employee, EmployeeRole } from '../employee.models';

@Injectable({ providedIn: 'root' })
export class EmployeesApiService {
  private readonly http = inject(HttpClient);

  list(query: BusinessListQuery) {
    return this.http.get<ApiResponse<PaginationResponse<Employee>>>(buildBusinessListUrl('employees', query)).pipe(map(response => response.results));
  }

  create(model: CreateEmployeeModel) { return this.http.post('/api/employees', model); }
  changeRole(id: string, role: EmployeeRole) { return this.http.put<void>(`/api/employees/${id}/role`, { role }); }
  setStatus(id: string, isActive: boolean) { return this.http.put<void>(`/api/employees/${id}/status`, { isActive }); }
}
