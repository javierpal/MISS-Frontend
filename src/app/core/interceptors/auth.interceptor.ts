import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

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
      if (error.status === 401) {
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
      return throwError(() => error);
    })
  );
};
