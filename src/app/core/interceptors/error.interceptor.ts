import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/** Map HTTP status codes to user-friendly messages */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Solicitud incorrecta',
  403: 'No tienes permisos para esta acción',
  404: 'Recurso no encontrado',
  409: 'Conflicto con datos existentes',
  500: 'Error interno del servidor',
  502: 'Servicio no disponible',
  503: 'Servicio temporalmente no disponible',
};

/**
 * Error interceptor — solo maneja errores NO-auth (403/404/409/5xx).
 * El manejo de 401/refresh/retry es responsabilidad exclusiva de authInterceptor.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Delegar 401 a authInterceptor (no lo manejamos aqui)
      if (error.status === 401) {
        return throwError(() => error);
      }

      const message = STATUS_MESSAGES[error.status]
        || error.error?.message
        || error.message
        || 'Error desconocido';

      return throwError(() => new Error(message));
    })
  );
};
