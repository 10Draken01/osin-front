import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { PedidoRepository } from '../../../domain/ports/pedido.repository';
import { NuevaPartida, Pedido } from '../../../domain/models/pedido.model';
import { AppError } from '../../../domain/errors/app-error';

/**
 * CU-04. Crea un pedido en BORRADOR. Solo envía producto y cantidad: precios y totales
 * los calcula el servidor. No descuenta inventario.
 */
@Injectable({ providedIn: 'root' })
export class RegistrarPedidoUseCase {
  private readonly repositorio = inject(PedidoRepository);

  execute(partidas: readonly NuevaPartida[]): Observable<Pedido> {
    const errores = validarPartidas(partidas);
    if (errores.length > 0) {
      return throwError(
        () => new AppError('VALIDACION', 'Los datos enviados no son válidos.', 400, errores),
      );
    }
    return this.repositorio.registrar(partidas);
  }
}

export function validarPartidas(partidas: readonly NuevaPartida[]): string[] {
  if (partidas.length === 0) return ['productos: El pedido debe contener al menos un producto'];
  const errores: string[] = [];
  const vistos = new Set<number>();
  partidas.forEach((p, i) => {
    if (!Number.isInteger(p.cantidad) || p.cantidad <= 0)
      errores.push(`productos[${i}].cantidad: La cantidad debe ser mayor a 0`);
    if (vistos.has(p.idProducto))
      errores.push(`El producto con id ${p.idProducto} esta repetido en el pedido`);
    vistos.add(p.idProducto);
  });
  return errores;
}
