import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Guard que verifica que el usuario tenga rol 'ADMIN'.
 * Si no tiene el rol, redirige a /app/cash (caja cajero).
 */
export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();

  if (!user) {
    return router.parseUrl('/login');
  }

  if (user.role === 'ADMIN') {
    return true;
  }

  // No-admin intenta acceder a vista admin: redirigir a caja cajero
  return router.parseUrl('/app/cash');
};
