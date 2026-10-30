import { HttpErrorResponse } from '@angular/common/http';
import { AppError, TipoError } from '../../../domain/errors/app-error';
import { ProblemaDto } from '../dto/problema.dto';

/** Traduce cualquier error HTTP a AppError usando el ProblemDetail del backend cuando existe. */
export function aAppError(error: HttpErrorResponse): AppError {
  if (error.status === 0) {
    return new AppError(
      'SIN_CONEXION',
      'No se pudo conectar con el servidor. Verifica que la API esté en ejecución en el puerto 8080.',
      0,
    );
  }

  const problema = esProblema(error.error) ? error.error : null;
  const tipo = tipoPorStatus(error.status);
  const mensaje = problema?.detail?.trim() || mensajePorTipo(tipo);
  const detalles = Array.isArray(problema?.errores) ? problema.errores : [];
  return new AppError(tipo, mensaje, error.status, detalles);
}

export function tipoPorStatus(status: number): TipoError {
  if (status === 400) return 'VALIDACION';
  if (status === 404) return 'NO_ENCONTRADO';
  if (status === 409) return 'CONFLICTO';
  if (status >= 500) return 'SERVIDOR';
  return 'DESCONOCIDO';
}

function mensajePorTipo(tipo: TipoError): string {
  switch (tipo) {
    case 'VALIDACION':
      return 'Los datos enviados no son válidos.';
    case 'NO_ENCONTRADO':
      return 'No se encontró el registro solicitado.';
    case 'CONFLICTO':
      return 'La operación no se pudo completar por un conflicto con el estado actual.';
    case 'SERVIDOR':
      return 'Error interno del servidor. Contacte al administrador.';
    default:
      return 'Ocurrió un error inesperado.';
  }
}

function esProblema(valor: unknown): valor is ProblemaDto {
  return typeof valor === 'object' && valor !== null && ('detail' in valor || 'status' in valor);
}
