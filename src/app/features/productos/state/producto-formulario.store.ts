import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { DatosProducto, Producto } from '@core/domain/models/producto.model';
import { AppError } from '@core/domain/errors/app-error';
import { ObtenerProductoUseCase } from '@core/application/use-cases/productos/obtener-producto.use-case';
import { GuardarProductoUseCase } from '@core/application/use-cases/productos/guardar-producto.use-case';

/** Estado del formulario de producto (alta o edición). */
@Injectable()
export class ProductoFormularioStore {
  private readonly obtener = inject(ObtenerProductoUseCase);
  private readonly guardarUseCase = inject(GuardarProductoUseCase);

  readonly producto = signal<Producto | null>(null);
  readonly cargando = signal(false);
  readonly errorCarga = signal<AppError | null>(null);
  readonly guardando = signal(false);
  readonly errorGuardado = signal<AppError | null>(null);

  cargar(id: number): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.obtener
      .execute(id)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (p) => this.producto.set(p),
        error: (e: unknown) => this.errorCarga.set(AppError.desde(e)),
      });
  }

  guardar(datos: DatosProducto): Observable<Producto> {
    this.guardando.set(true);
    this.errorGuardado.set(null);
    return this.guardarUseCase.execute(datos, this.producto()?.id).pipe(
      tap({ error: (e: unknown) => this.errorGuardado.set(AppError.desde(e)) }),
      finalize(() => this.guardando.set(false)),
    );
  }
}
