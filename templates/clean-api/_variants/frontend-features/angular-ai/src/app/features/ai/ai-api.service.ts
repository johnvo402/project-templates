import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ROUTES } from '../../core/api/api.routes';
import { ApiResponse } from '../../core/api/api.models';

@Injectable({ providedIn: 'root' })
export class AiApiService {
  private readonly http = inject(HttpClient);
  generate(prompt: string): Observable<string> {
    return this.http.post<ApiResponse<{ text: string }>>(API_ROUTES.ai.generate, { prompt }).pipe(map(x => x.results.text));
  }
}
