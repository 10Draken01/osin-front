import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, forkJoin, of, tap } from 'rxjs';
import { Pedido } from '@core/domain/models/pedido.model';
import { Producto } from '@core/domain/models/producto.model';
import { AppError } from '@core/domain/errors/app-error';
import { esEditable } from '@core/domain/rules/estado-pedido.rules';
import {
  CARRITO_VACIO,
  Carrito,
  aPartidas,
  agregarAlCarrito,
  cambiarCantidad,
  quitarDelCarrito,
} from '@core/domain/rules/carrito';
import { ListarProductosActivosUseCase } from '@core/application/use-cases/productos/listar-productos-activos.use-case';
import { ObtenerPedidoUseCase } from '@core/application/use-cases/pedidos/obtener-pedido.use-case';
import { RegistrarPedidoUseCase } from '@core/application/use-cases/pedidos/registrar-pedido.use-case';
import { ActualizarPedidoUseCase } from '@core/application/use-cases/pedidos/actualizar-pedido.use-case';

/**
 * Estado de la captura de un pedido: catálogo activo + carrito.
 * Sirve para crear (sin pedido) y para editar un BORRADOR (con pedido).
 */
@Injectable()
export class PedidoFormularioStore {
  private readonly listarActivos = inject(ListarProductosActivosUseCase);
  private readonly obtenerPedido = inject(ObtenerPedidoUseCase);
  private readonly registrar = inject(RegistrarPedidoUseCase);
  private readonly actualizar = inject(ActualizarPedidoUseCase);

  readonly productos = signal<readonly Producto[]>([]);
  readonly cargando = signal(false);
  readonly errorCarga = signal<AppError | null>(null);

  /** Pedido que se edita; null al crear. */
  readonly pedido = signal<Pedido | null>(null);
  readonly esEdicion = computed(() => this.pedido() !== null);
  /** El pedido existe pero ya no está en BORRADOR (lo confirmaron o cancelaron). */
  readonly noEditable = computed(() => {
    const p = this.pedido();
    return p !== null && !esEditable(p.estado);
  });
  /** Partidas del pedido cuyo producto ya no está activo y se quitaron al cargar. */
  readonly partidasRetiradas = signal<readonly string[]>([]);

  readonly carrito = signal<Carrito>(CARRITO_VACIO);
  readonly guardando = signal(false);
  readonly errorGuardado = signal<AppError | null>(null);

  /** id de producto → cantidad, para que el catálogo marque lo ya agregado. */
  readonly cantidades = computed(
    () => new Map(this.carrito().map((l) => [l.producto.id, l.cantidad] as const)),
  );

  /** Carga el catálogo y, si se indica, el pedido a editar (en paralelo). */
  cargar(idPedido: number | null = null): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    forkJoin({
      productos: this.listarActivos.execute(),
      pedido: idPedido ? this.obtenerPedido.execute(idPedido) : of(null),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ productos, pedido }) => {
          this.productos.set(productos);
          this.pedido.set(pedido);
          if (pedido) this.carrito.set(this.carritoDesde(pedido, productos));
          else this.sincronizarCarrito(productos);
        },
        error: (e: unknown) => this.errorCarga.set(AppError.desde(e)),
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

  /** POST al crear, PUT al editar. */
  guardar(): Observable<Pedido> {
    const partidas = aPartidas(this.carrito());
    const pedido = this.pedido();
    this.guardando.set(true);
    this.errorGuardado.set(null);
    const peticion = pedido
      ? this.actualizar.execute(pedido, partidas)
      : this.registrar.execute(partidas);
    return peticion.pipe(
      tap({
        next: () => {
          if (!pedido) this.carrito.set(CARRITO_VACIO);
        },
        error: (e: unknown) => {
          const error = AppError.desde(e);
          this.errorGuardado.set(error);
          // 404: un producto se desactivó durante la captura; 409: el pedido cambió de estado
          if (error.tipo === 'NO_ENCONTRADO' || error.tipo === 'CONFLICTO') {
            this.recargarDespuesDeError(pedido?.id ?? null);
          }
        },
      }),
      finalize(() => this.guardando.set(false)),
    );
  }

  /**
   * Arma el carrito con las partidas del pedido usando el producto del catálogo actual,
   * así el total estimado ya muestra el precio vigente (el que aplicará el servidor al guardar).
   */
  private carritoDesde(pedido: Pedido, activos: readonly Producto[]): Carrito {
    const porId = new Map(activos.map((p) => [p.id, p]));
    const retiradas: string[] = [];
    const carrito: Carrito = pedido.partidas.flatMap((partida) => {
      const producto = porId.get(partida.idProducto);
      if (!producto) {
        retiradas.push(partida.nombre);
        return [];
      }
      return [{ producto, cantidad: partida.cantidad }];
    });
    this.partidasRetiradas.set(retiradas);
    return carrito;
  }

  /** Tras un error se refresca el catálogo (y el estado del pedido) sin perder lo capturado. */
  private recargarDespuesDeError(idPedido: number | null): void {
    forkJoin({
      productos: this.listarActivos.execute(),
      pedido: idPedido ? this.obtenerPedido.execute(idPedido) : of(null),
    }).subscribe({
      next: ({ productos, pedido }) => {
        this.productos.set(productos);
        if (pedido) this.pedido.set(pedido);
        this.sincronizarCarrito(productos);
      },
      error: () => {
        /* Se conserva el error original */
      },
    });
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
