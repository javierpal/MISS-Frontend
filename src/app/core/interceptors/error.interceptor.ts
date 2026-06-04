import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

/** Map HTTP status codes to user-friendly messages */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Solicitud incorrecta',
  401: 'Sesión expirada',
  403: 'No tienes permisos para esta acción',
  404: 'Recurso no encontrado',
  409: 'Conflicto con datos existentes',
  500: 'Error interno del servidor',
  502: 'Servicio no disponible',
  503: 'Servicio temporalmente no disponible',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Skip refresh loop on auth endpoints
        if (req.url.includes('/auth/refresh') || req.url.includes('/auth/login')) {
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        }

        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          return authService.refresh().pipe(
            catchError(() => {
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => error);
            }),
            () => {
              const newToken = tokenStorage.getAccessToken();
              if (newToken) {
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`,
                  },
                });
                return next(retryReq);
              }
              return throwError(() => error);
            }
          );
        } else {
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        }
      }

      if (error.status === 403) {
        // Optionally redirect or show permission denied
      }

      const message = STATUS_MESSAGES[error.status]
        || error.error?.message
        || error.message
        || 'Error desconocido';

      return throwError(() => new Error(message));
    })
  );
};
