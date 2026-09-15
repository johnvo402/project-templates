import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AccessTokenStore } from './access-token.store';
import { AuthSessionService } from './auth-session.service';

const authPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokens = inject(AccessTokenStore);
  const session = inject(AuthSessionService);
  const attach = () => {
    const token = tokens.get();
    return request.clone({
      withCredentials: true,
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });
  };

  return next(attach()).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401 || authPaths.some(path => request.url.includes(path)))
        return throwError(() => error);
      return from(session.refresh()).pipe(
        switchMap(user => user ? next(attach()) : throwError(() => error)),
      );
    }),
  );
};
