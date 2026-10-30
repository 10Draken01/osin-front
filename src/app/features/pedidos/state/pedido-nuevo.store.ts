import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { Pedido } from '@core/domain/models/pedido.model';
import { Producto } from '@core/domain/models/producto.model';
import { AppError } from '@core/domain/errors/app-error';
import {
  CARRITO_VACIO,
  Carrito,
  aPartidas,
  agregarAlCarrito,
  cambiarCantidad,
  quitarDelCarrito,
} from '@core/domain/rules/carrito';
import { ListarProductosActivosUseCase } from '@core/application/use-cases/productos/listar-productos-activos.use-case';
import { RegistrarPedidoUseCase } from '@core/application/use-cases/pedidos/registrar-pedido.use-case';

/** Estado de la captura de un pedido: catálogo activo + carrito. */
@Injectable()
export class PedidoNuevoStore {
  private readonly listarActivos = inject(ListarProductosActivosUseCase);
  private readonly registrar = inject(RegistrarPedidoUseCase);

  readonly productos = signal<readonly Producto[]>([]);
  readonly cargandoProductos = signal(false);
  readonly errorProductos = signal<AppError | null>(null);

  readonly carrito = signal<Carrito>(CARRITO_VACIO);
  readonly guardando = signal(false);
  readonly errorGuardado = signal<AppError | null>(null);

  /** id de producto → cantidad, para que el catálogo marque lo ya agregado. */
  readonly cantidades = computed(
    () => new Map(this.carrito().map((l) => [l.producto.id, l.cantidad] as const)),
  );

  cargarProductos(): void {
    this.cargandoProductos.set(true);
    this.errorProductos.set(null);
    this.listarActivos
      .execute()
      .pipe(finalize(() => this.cargandoProductos.set(false)))
      .subscribe({
        next: (lista) => {
          this.productos.set(lista);
          this.sincronizarCarrito(lista);
        },
        error: (e: unknown) => this.errorProductos.set(AppError.desde(e)),
      });
  }

  agregar(producto: Producto): void {
    this.carrito.update((c) => agregarAlCarrito(c, producto));
  }

  cambiarCantidad(idProducto: number, cantidad: number): void {
    this.carrito.update((c) => cambiarCantidad(c, idProducto, cantidad));
  }

  quitar(idProducto: number): void {
    this.carrito.update((c) => quitarDelCarrito(c, idProducto));
  }

  vaciar(): void {
    this.carrito.set(CARRITO_VACIO);
    this.errorGuardado.set(null);
  }

  crear(): Observable<Pedido> {
    this.guardando.set(true);
    this.errorGuardado.set(null);
    return this.registrar.execute(aPartidas(this.carrito())).pipe(
      tap({
        next: () => this.carrito.set(CARRITO_VACIO),
        error: (e: unknown) => {
          const error = AppError.desde(e);
          this.errorGuardado.set(error);
          // 404: un producto se desactivó mientras se capturaba; se refresca el catálogo
          if (error.tipo === 'NO_ENCONTRADO') this.cargarProductos();
        },
      }),
      finalize(() => this.guardando.set(false)),
    );
  }

  /** Quita del carrito lo que ya no está activo y actualiza precio/existencia de lo demás. */
  private sincronizarCarrito(activos: readonly Producto[]): void {
    const porId = new Map(activos.map((p) => [p.id, p]));
    this.carrito.update((c) =>
      c
        .filter((l) => porId.has(l.producto.id))
        .map((l) => ({ ...l, producto: porId.get(l.producto.id)! })),
    );
  }
}
