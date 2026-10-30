import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PedidoRepository } from '../../../domain/ports/pedido.repository';
import { Pedido } from '../../../domain/models/pedido.model';
import { validarTransicion } from './validar-transicion';

/** CU-07. Confirmar: valida stock de todas las partidas y descuenta inventario (en el servidor). */
@Injectable({ providedIn: 'root' })
export class ConfirmarPedidoUseCase {
  private readonly repositorio = inject(PedidoRepository);

  execute(pedido: Pedido): Observable<Pedido> {
    return validarTransicion(pedido, 'confirmar') ?? this.repositorio.confirmar(pedido.id);
  }
}
