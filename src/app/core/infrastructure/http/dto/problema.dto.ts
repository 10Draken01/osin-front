/** ProblemDetail (RFC 9457) que responde GlobalExceptionHandler. */
export interface ProblemaDto {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  /** Solo en errores de validación. */
  errores?: string[];
}
