import type { ApiResponse, PaginationResponse } from '../../../core/api/api-types';
import { customFetch } from '../../../core/api/custom-fetch';
import { buildBusinessListUrl, type BusinessListQuery } from '../../business/business-query';
import type { CreateEmployeeModel, Employee, EmployeeRole } from '../employee.models';

async function result<T>(path: string): Promise<T> {
  const response = await customFetch<ApiResponse<T>>(path);
  return response.results;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const employeesApi = {
  list(query: BusinessListQuery) {
    return result<PaginationResponse<Employee>>(buildBusinessListUrl('employees', query));
  },
  create(model: CreateEmployeeModel) {
    return customFetch<unknown>('/api/employees', json('POST', model));
  },
  changeRole(id: string, role: EmployeeRole) {
    return customFetch<unknown>(`/api/employees/${id}/role`, json('PUT', { role }));
  },
  setStatus(id: string, isActive: boolean) {
    return customFetch<unknown>(`/api/employees/${id}/status`, json('PUT', { isActive }));
  },
};
