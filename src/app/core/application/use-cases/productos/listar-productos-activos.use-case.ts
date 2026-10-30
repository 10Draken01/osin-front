import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository } from '../../../domain/ports/producto.repository';
import { Producto } from '../../../domain/models/producto.model';

/** CU-01. Catálogo disponible para armar pedidos (solo productos activos). */
@Injectable({ providedIn: 'root' })
export class ListarProductosActivosUseCase {
  private readonly repositorio = inject(ProductoRepository);

  execute(): Observable<Producto[]> {
    return this.repositorio.listarActivos();
  }
}
