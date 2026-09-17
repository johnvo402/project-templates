import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API_ROUTES } from '../../../core/api/api.routes';
import type { ApiResponse, PaginationResponse } from '../../../core/api/api.models';
import { buildListUrl, type ListQuery } from '../../../core/api/list-query';
import type { CreateEmployeeModel, Employee, EmployeeRole } from '../employee.models';

@Injectable({ providedIn: 'root' })
export class EmployeesApiService {
  private readonly http = inject(HttpClient);

  list(query: ListQuery) {
    return this.http.get<ApiResponse<PaginationResponse<Employee>>>(buildListUrl('employees', query)).pipe(map(response => response.results));
  }

  create(model: CreateEmployeeModel) { return this.http.post(API_ROUTES.employees.root, model); }
  changeRole(id: string, role: EmployeeRole) { return this.http.put<void>(`${API_ROUTES.employees.byId(id)}/role`, { role }); }
  setStatus(id: string, isActive: boolean) { return this.http.put<void>(`${API_ROUTES.employees.byId(id)}/status`, { isActive }); }
}
