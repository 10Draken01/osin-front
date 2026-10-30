import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, finalize, of, switchMap, tap } from 'rxjs';
import { Producto } from '@core/domain/models/producto.model';
import { Pagina, TAMANO_PAGINA_DEFECTO } from '@core/domain/models/pagina.model';
import { AppError } from '@core/domain/errors/app-error';
import { ListarProductosUseCase } from '@core/application/use-cases/productos/listar-productos.use-case';
import { CambiarDisponibilidadProductoUseCase } from '@core/application/use-cases/productos/cambiar-disponibilidad-producto.use-case';

/**
 * Estado de la pantalla de productos (patrón Facade/Store con signals).
 * Se provee en el componente de la página, así su vida dura lo mismo que la pantalla.
 */
@Injectable()
export class ProductosListaStore {
  private readonly listar = inject(ListarProductosUseCase);
  private readonly cambiarDisponibilidad = inject(CambiarDisponibilidadProductoUseCase);

  readonly pagina = signal<Pagina<Producto> | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<AppError | null>(null);
  readonly procesandoId = signal<number | null>(null);

  private numeroActual = 0;
  private readonly solicitudes = new Subject<number>();

  constructor() {
    // switchMap descarta respuestas viejas si el usuario cambia de página rápido
    this.solicitudes
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap((numero) =>
          this.listar.execute({ pagina: numero, tamano: TAMANO_PAGINA_DEFECTO }).pipe(
            catchError((e: unknown) => {
              this.error.set(AppError.desde(e));
              return of(null);
            }),
            finalize(() => this.cargando.set(false)),
          ),
        ),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((pagina) => {
        if (pagina) this.pagina.set(pagina);
      });
  }

  cargar(numero: number): void {
    this.numeroActual = numero;
    this.solicitudes.next(numero);
  }

  recargar(): void {
    this.cargar(this.numeroActual);
  }

  /** Activa o desactiva. Devuelve una promesa para que la página muestre el aviso adecuado. */
  alternarDisponibilidad(producto: Producto): Promise<void> {
    this.procesandoId.set(producto.id);
    return new Promise<void>((resolve, reject) => {
      this.cambiarDisponibilidad
        .execute(producto)
        .pipe(finalize(() => this.procesandoId.set(null)))
        .subscribe({
          next: () => {
            // Actualización local: evita recargar toda la página para un solo renglón
            this.pagina.update((p) =>
              p
                ? {
                    ...p,
                    elementos: p.elementos.map((x) =>
                      x.id === producto.id ? { ...x, activo: !producto.activo } : x,
                    ),
                  }
                : p,
            );
            resolve();
          },
          error: (e: unknown) => reject(AppError.desde(e)),
        });
    });
  }
}
