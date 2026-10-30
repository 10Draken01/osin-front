import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { PedidoRepository } from '../../../domain/ports/pedido.repository';
import { NuevaPartida, Pedido } from '../../../domain/models/pedido.model';
import { AppError } from '../../../domain/errors/app-error';
import { ETIQUETA_ESTADO, esEditable } from '../../../domain/rules/estado-pedido.rules';
import { validarPartidas } from './registrar-pedido.use-case';

/**
 * CU-10. Reemplaza las partidas de un pedido en BORRADOR (PUT /api/pedidos/{id}).
 * El servidor recalcula todas las partidas con el precio vigente del catálogo. No mueve inventario.
 */
@Injectable({ providedIn: 'root' })
export class ActualizarPedidoUseCase {
  private readonly repositorio = inject(PedidoRepository);

  execute(pedido: Pedido, partidas: readonly NuevaPartida[]): Observable<Pedido> {
    if (!esEditable(pedido.estado)) {
      return throwError(
        () =>
          new AppError(
            'CONFLICTO',
            `El pedido no se puede modificar porque esta en estado ${ETIQUETA_ESTADO[pedido.estado]}`,
            409,
          ),
      );
    }
    const errores = validarPartidas(partidas);
    if (errores.length > 0) {
      return throwError(
        () => new AppError('VALIDACION', 'Los datos enviados no son válidos.', 400, errores),
      );
    }
    return this.repositorio.actualizar(pedido.id, partidas);
  }
}
