import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { buildFilterQuery } from '../../../lib/filter';
import { API_ROUTES } from '../../core/api/api.routes';
import { ApiResponse, PaginationResponse } from '../../core/api/api.models';
import { Todo } from './todo.models';

@Injectable({ providedIn: 'root' })
export class TodoApiService {
  private readonly http = inject(HttpClient);

  list(page: number, pageSize: number, search = ''): Observable<PaginationResponse<Todo>> {
    const paging = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const filterQuery = search.trim()
      ? buildFilterQuery({ Title: { $containsi: search.trim() } })
      : '';
    const query = [paging.toString(), filterQuery].filter(Boolean).join('&');

    return this.http
      .get<ApiResponse<PaginationResponse<Todo>>>(`${API_ROUTES.todos.root}?${query}`)
      .pipe(map(response => response.results));
  }

  create(title: string) {
    return this.http.post(API_ROUTES.todos.root, { title });
  }

  complete(id: string) {
    return this.http.post(API_ROUTES.todos.complete(id), {});
  }
}
