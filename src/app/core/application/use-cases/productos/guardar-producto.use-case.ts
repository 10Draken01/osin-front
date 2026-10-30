import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ProductoRepository } from '../../../domain/ports/producto.repository';
import { DatosProducto, LIMITES_PRODUCTO, Producto } from '../../../domain/models/producto.model';
import { AppError } from '../../../domain/errors/app-error';

/**
 * CU-02. Registrar (sin id) o actualizar (con id) un producto.
 * Limpia los datos y aplica las mismas reglas que el backend para no hacer viajes inútiles;
 * el backend vuelve a validar todo.
 */
@Injectable({ providedIn: 'root' })
export class GuardarProductoUseCase {
  private readonly repositorio = inject(ProductoRepository);

  execute(datos: DatosProducto, id?: number | null): Observable<Producto> {
    const limpio = limpiarDatosProducto(datos);
    const errores = validarDatosProducto(limpio);
    if (errores.length > 0) {
      return throwError(
        () => new AppError('VALIDACION', 'Los datos enviados no son válidos.', 400, errores),
      );
    }
    return id ? this.repositorio.actualizar(id, limpio) : this.repositorio.registrar(limpio);
  }
}

export function limpiarDatosProducto(datos: DatosProducto): DatosProducto {
  const descripcion = datos.descripcion?.trim() ?? '';
  return {
    nombre: datos.nombre.trim(),
    // Oracle guarda '' como NULL; se envía null para que sea explícito.
    descripcion: descripcion.length > 0 ? descripcion : null,
    precioUnitario: Number(datos.precioUnitario),
    existencia: Number(datos.existencia),
  };
}

/** Devuelve los errores con el formato "campo: mensaje" que también usa el backend. */
export function validarDatosProducto(d: DatosProducto): string[] {
  const errores: string[] = [];
  if (!d.nombre) errores.push('nombre: El nombre del producto es requerido');
  if (d.nombre.length > LIMITES_PRODUCTO.nombreMax)
    errores.push(`nombre: El nombre no puede exceder ${LIMITES_PRODUCTO.nombreMax} caracteres`);
  if ((d.descripcion?.length ?? 0) > LIMITES_PRODUCTO.descripcionMax)
    errores.push(
      `descripcion: La descripcion no puede exceder ${LIMITES_PRODUCTO.descripcionMax} caracteres`,
    );
  if (!Number.isFinite(d.precioUnitario) || d.precioUnitario <= 0)
    errores.push('precioUnitario: El precio unitario debe ser mayor a 0');
  else if (!tieneDigitosValidos(d.precioUnitario))
    errores.push('precioUnitario: El precio admite hasta 10 enteros y 2 decimales');
  if (!Number.isInteger(d.existencia) || d.existencia < 0)
    errores.push('existencia: La existencia del producto no puede ser negativa');
  return errores;
}

function tieneDigitosValidos(valor: number): boolean {
  const [enteros, decimales = ''] = String(valor).split('.');
  return (
    enteros.length <= LIMITES_PRODUCTO.precioEnterosMax &&
    decimales.length <= LIMITES_PRODUCTO.precioDecimalesMax
  );
}
