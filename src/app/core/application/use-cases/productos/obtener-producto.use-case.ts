import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository } from '../../../domain/ports/producto.repository';
import { Producto } from '../../../domain/models/producto.model';

/** CU-01. Detalle de un producto (se usa para precargar el formulario de edición). */
@Injectable({ providedIn: 'root' })
export class ObtenerProductoUseCase {
  private readonly repositorio = inject(ProductoRepository);

  execute(id: number): Observable<Producto> {
    return this.repositorio.obtenerPorId(id);
  }
}
