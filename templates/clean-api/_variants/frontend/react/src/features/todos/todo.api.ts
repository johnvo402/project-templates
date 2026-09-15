import { API_ROUTES } from '../../core/api/api-routes';
import type { ApiResponse, PaginationResponse } from '../../core/api/api-types';
import { customFetch } from '../../core/api/custom-fetch';
import type { Todo } from './todo.models';

export type TodoListInput = { page: number; pageSize: number; search?: string };

export const todoApi = {
  async list(input: TodoListInput): Promise<PaginationResponse<Todo>> {
    const params = new URLSearchParams({ page: String(input.page), pageSize: String(input.pageSize) });
    if (input.search?.trim()) params.set('filter[Title][$containsi]', input.search.trim());
    return (await customFetch<ApiResponse<PaginationResponse<Todo>>>(`${API_ROUTES.todos.root}?${params}`)).results;
  },
  async create(title: string): Promise<void> {
    await customFetch<ApiResponse<string>>(API_ROUTES.todos.root, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }),
    });
  },
  async complete(id: string): Promise<void> { await customFetch<void>(API_ROUTES.todos.complete(id), { method: 'POST' }); },
};
