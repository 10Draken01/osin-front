import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRepository } from '../../../domain/ports/producto.repository';
import { Producto } from '../../../domain/models/producto.model';

/**
 * CU-03. Activar o desactivar (baja lógica). Elige el endpoint según el estado actual,
 * así la vista solo dice "cambia la disponibilidad de este producto".
 */
@Injectable({ providedIn: 'root' })
export class CambiarDisponibilidadProductoUseCase {
  private readonly repositorio = inject(ProductoRepository);

  execute(producto: Producto): Observable<void> {
    return producto.activo
      ? this.repositorio.desactivar(producto.id)
      : this.repositorio.activar(producto.id);
  }
}
