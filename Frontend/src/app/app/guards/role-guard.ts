import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const allowed: string[] = (route.data?.['roles'] as string[]) || [];
  const role = auth.getRole();
  if (!allowed.length) return true;
  if (role && allowed.includes(role)) return true;
  return router.parseUrl('/login');
};
