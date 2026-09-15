import { API_ROUTES } from '../../core/api/api-routes';
import type { ApiResponse, PaginationResponse } from '../../core/api/api-types';
import { customFetch } from '../../core/api/custom-fetch';
import { buildFilterQuery } from '../../lib/filter';
import type { Todo } from './todo.models';

export type TodoListInput = { page: number; pageSize: number; search?: string };

export const todoApi = {
  async list(input: TodoListInput): Promise<PaginationResponse<Todo>> {
    const paging = new URLSearchParams({
      page: String(input.page),
      pageSize: String(input.pageSize),
    });

    const filterQuery = input.search?.trim()
      ? buildFilterQuery({ Title: { $containsi: input.search.trim() } })
      : '';
    const query = [paging.toString(), filterQuery].filter(Boolean).join('&');

    return (await customFetch<ApiResponse<PaginationResponse<Todo>>>(`${API_ROUTES.todos.root}?${query}`)).results;
  },

  async create(title: string): Promise<void> {
    await customFetch<ApiResponse<string>>(API_ROUTES.todos.root, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
  },

  async complete(id: string): Promise<void> {
    await customFetch<void>(API_ROUTES.todos.complete(id), { method: 'POST' });
  },
};
