import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { API_ROUTES } from '../../core/api/api.routes';
import { ApiResponse } from '../../core/api/api.models';

export type BusinessChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type BusinessChatResponse = {
  answer: string;
  topic: string;
  suggestedQuestions: string[];
};

@Injectable({ providedIn: 'root' })
export class AiApiService {
  private readonly http = inject(HttpClient);

  getBusinessChatHistory(): Observable<BusinessChatMessage[]> {
    return this.http.get<ApiResponse<BusinessChatMessage[]>>(API_ROUTES.ai.businessChatHistory).pipe(
      map(response => response.results),
      catchError(error => throwError(() => new Error(
        error?.error?.title ?? error?.error?.detail ?? 'Unable to load AI chat history.',
      ))),
    );
  }

  askBusinessQuestion(question: string): Observable<BusinessChatResponse> {
    return this.http.post<ApiResponse<BusinessChatResponse>>(API_ROUTES.ai.businessChat, { question }).pipe(
      map(response => response.results),
      catchError(error => throwError(() => new Error(
        error?.error?.title ?? error?.error?.detail ?? 'Business AI request failed.',
      ))),
    );
  }
}
