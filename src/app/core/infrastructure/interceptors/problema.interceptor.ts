import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { aAppError } from '../http/mappers/problema.mapper';

/**
 * Convierte todo HttpErrorResponse en AppError. A partir de aquí ninguna capa
 * depende de HttpClient para entender un error.
 */
export const problemaInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: unknown) =>
      throwError(() => (error instanceof HttpErrorResponse ? aAppError(error) : error)),
    ),
  );
