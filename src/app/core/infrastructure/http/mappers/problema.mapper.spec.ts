import { HttpErrorResponse } from '@angular/common/http';
import { aAppError } from './problema.mapper';

describe('aAppError (ProblemDetail → AppError)', () => {
  const error = (status: number, cuerpo: unknown) =>
    new HttpErrorResponse({ status, error: cuerpo, statusText: 'x' });

  it('400 conserva la lista "errores" de validación', () => {
    const e = aAppError(
      error(400, {
        status: 400,
        detail: 'Los datos enviados no son válidos.',
        errores: ['nombre: El nombre del producto es requerido'],
      }),
    );
    expect(e.tipo).toBe('VALIDACION');
    expect(e.detalles).toEqual(['nombre: El nombre del producto es requerido']);
  });

  it('404 y 409 usan el detail del servidor', () => {
    expect(aAppError(error(404, { detail: 'Pedido no encontrado con id: 99' })).message).toBe(
      'Pedido no encontrado con id: 99',
    );
    expect(aAppError(error(409, { detail: 'duplicado' })).tipo).toBe('CONFLICTO');
  });

  it('status 0 indica que el servidor no responde', () => {
    expect(aAppError(error(0, null)).tipo).toBe('SIN_CONEXION');
  });

  it('sin ProblemDetail usa un mensaje genérico', () => {
    const e = aAppError(error(500, '<html>'));
    expect(e.tipo).toBe('SERVIDOR');
    expect(e.message).toContain('Error interno');
  });
});
