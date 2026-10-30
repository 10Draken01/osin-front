/**
 * Categorías de error que la interfaz sabe tratar.
 * Se derivan del código HTTP del ProblemDetail (RFC 9457) que devuelve el backend.
 */
export type TipoError =
  | 'VALIDACION' // 400
  | 'NO_ENCONTRADO' // 404
  | 'CONFLICTO' // 409: stock insuficiente, transición no permitida, duplicado, concurrencia
  | 'SIN_CONEXION' // status 0: el backend no responde o CORS lo bloquea
  | 'SERVIDOR' // 5xx
  | 'DESCONOCIDO';

/**
 * Error de la aplicación. Las capas superiores nunca ven HttpErrorResponse:
 * el interceptor lo convierte en AppError.
 */
export class AppError extends Error {
  constructor(
    readonly tipo: TipoError,
    message: string,
    readonly status: number = 0,
    /** Mensajes de validación por campo, p. ej. "productos[0].cantidad: La cantidad debe ser mayor a 0". */
    readonly detalles: readonly string[] = [],
  ) {
    super(message);
    this.name = 'AppError';
  }

  static esAppError(valor: unknown): valor is AppError {
    return valor instanceof AppError;
  }

  /** Convierte cualquier valor lanzado en un AppError para mostrarlo al usuario. */
  static desde(valor: unknown): AppError {
    if (valor instanceof AppError) return valor;
    const mensaje = valor instanceof Error ? valor.message : 'Ocurrió un error inesperado.';
    return new AppError('DESCONOCIDO', mensaje);
  }
}
