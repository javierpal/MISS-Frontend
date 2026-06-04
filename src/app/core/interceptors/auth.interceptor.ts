import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, mergeMap, throwError } from 'rxjs';

import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

/**
 * Auth interceptor — unico dueño del flujo 401/refresh/retry.
 *
 * Flujo:
 * 1. Si la request no tiene token y no es auth endpoint → agregar Bearer token
 * 2. Si response es 401 en endpoints de auth → logout + redirect
 * 3. Si response es 401 en otra request:
 *    a. Si hay refresh token → intentar refresh
 *    b. Si refresh tiene éxito → reintentar la request original con nuevo token
 *    c. Si refresh falla → logout + redirect
 * 4. Si no hay refresh token → logout + redirect
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = tokenStorage.getAccessToken();

  let cloned = req;

  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
    cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 en endpoints de auth → logout inmediato
      if (error.status === 401 && (req.url.includes('/auth/refresh') || req.url.includes('/auth/login'))) {
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      // Solo manejar 401 en otras requests
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // No hay refresh token → logout
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      // Intentar refresh y reintentar la request original
      return authService.refresh().pipe(
        mergeMap((tokens) => {
          const newToken = tokenStorage.getAccessToken();
          if (!newToken) {
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => error);
          }

          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`,
            },
          });

          return next(retryReq);
        }),
        catchError(() => {
          // Refresh falló → logout + redirect
          authService.logout();
          router.navigate(['/login']);
          return throwError(() => error);
        })
      );
    })
  );
};
