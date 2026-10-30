import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PedidoRepository } from '../../../domain/ports/pedido.repository';
import { Pedido } from '../../../domain/models/pedido.model';
import { validarTransicion } from './validar-transicion';

/** CU-08. Cancelar desde BORRADOR o CONFIRMADO. Si estaba confirmado, el servidor repone inventario. */
@Injectable({ providedIn: 'root' })
export class CancelarPedidoUseCase {
  private readonly repositorio = inject(PedidoRepository);

  execute(pedido: Pedido): Observable<Pedido> {
    return validarTransicion(pedido, 'cancelar') ?? this.repositorio.cancelar(pedido.id);
  }
}
