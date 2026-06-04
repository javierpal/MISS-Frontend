import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error desconocido';

      if (error.status === 0) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else if (error.status === 401) {
        errorMessage = 'Sesión expirada. Inicia sesión nuevamente';
      } else if (error.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción';
      } else if (error.status === 404) {
        errorMessage = 'El recurso solicitado no existe';
      } else if (error.status === 409) {
        errorMessage = error.error?.message || 'Conflicto con el servidor';
      } else if (error.status >= 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};
