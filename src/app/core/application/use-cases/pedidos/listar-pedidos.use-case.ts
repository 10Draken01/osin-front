import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PedidoRepository } from '../../../domain/ports/pedido.repository';
import { FiltroPedidos, Pedido } from '../../../domain/models/pedido.model';
import {
  Pagina,
  SolicitudPagina,
  normalizarSolicitud,
} from '../../../domain/models/pagina.model';

/** CU-05. Pedidos con filtros por estado y folio (el backend los ordena del más reciente al más antiguo). */
@Injectable({ providedIn: 'root' })
export class ListarPedidosUseCase {
  private readonly repositorio = inject(PedidoRepository);

  execute(filtro: FiltroPedidos, solicitud: SolicitudPagina): Observable<Pagina<Pedido>> {
    const folio = filtro.folio?.trim().toUpperCase() ?? '';
    return this.repositorio.listar(
      { estado: filtro.estado ?? null, folio: folio.length > 0 ? folio : null },
      normalizarSolicitud(solicitud),
    );
  }
}
