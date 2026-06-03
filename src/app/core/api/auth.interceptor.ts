import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
 HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_TOKEN_KEY = 'miss_auth_token';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
}
