import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from './auth-session.service';

export const permissionGuard: CanActivateFn = async route => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);
  const user = auth.user() ?? await auth.bootstrap();
  if (!user) return router.parseUrl('/profile');
  const permission = route.data['permission'] as string | undefined;
  return !permission || auth.can(permission) ? true : router.parseUrl('/profile');
};
