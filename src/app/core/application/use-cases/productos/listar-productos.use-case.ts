import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository } from '../../../domain/ports/producto.repository';
import { Producto } from '../../../domain/models/producto.model';
import {
  Pagina,
  SolicitudPagina,
  normalizarSolicitud,
} from '../../../domain/models/pagina.model';

/** CU-01. Consultar el catálogo completo (activos e inactivos), paginado. */
@Injectable({ providedIn: 'root' })
export class ListarProductosUseCase {
  private readonly repositorio = inject(ProductoRepository);

  execute(solicitud: SolicitudPagina): Observable<Pagina<Producto>> {
    return this.repositorio.listar(normalizarSolicitud(solicitud));
  }
}
