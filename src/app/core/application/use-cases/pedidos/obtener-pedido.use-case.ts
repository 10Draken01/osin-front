import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PedidoRepository } from '../../../domain/ports/pedido.repository';
import { Pedido } from '../../../domain/models/pedido.model';

/** CU-06. Detalle de un pedido con sus partidas. */
@Injectable({ providedIn: 'root' })
export class ObtenerPedidoUseCase {
  private readonly repositorio = inject(PedidoRepository);

  execute(id: number): Observable<Pedido> {
    return this.repositorio.obtenerPorId(id);
  }
}
