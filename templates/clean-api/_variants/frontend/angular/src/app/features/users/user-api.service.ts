import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../../core/api/api.routes';
import { ApiResponse } from '../../core/api/api.models';
import { UserSummary } from './user.models';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  list(): Observable<UserSummary[]> { return this.http.get<ApiResponse<UserSummary[]>>(API_ROUTES.users.root).pipe(map(x => x.results)); }
  changeRole(id: string, role: string): Observable<unknown> { return this.http.put(API_ROUTES.users.role(id), { role }); }
}
