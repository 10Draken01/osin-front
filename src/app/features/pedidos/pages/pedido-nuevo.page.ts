import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Producto } from '@core/domain/models/producto.model';
import { BotonComponent, SpinnerComponent } from '@shared/ui/atoms';
import { AlertaComponent, EncabezadoPaginaComponent } from '@shared/ui/molecules';
import { PlantillaDetalleComponent } from '@shared/ui/templates';
import { NotificacionService } from '@shared/ui/services';
import { CatalogoPedidoComponent } from '../ui/organisms/catalogo-pedido.component';
import { ResumenPedidoComponent } from '../ui/organisms/resumen-pedido.component';
import { PedidoNuevoStore } from '../state/pedido-nuevo.store';

/**
 * Página: captura de pedido (CU-04). Catálogo a la izquierda, resumen fijo a la derecha.
 * Usa GET /api/productos/activos y POST /api/pedidos.
 */
@Component({
  selector: 'app-pedido-nuevo-page',
  imports: [
    BotonComponent,
    SpinnerComponent,
    AlertaComponent,
    EncabezadoPaginaComponent,
    PlantillaDetalleComponent,
    CatalogoPedidoComponent,
    ResumenPedidoComponent,
  ],
  providers: [PedidoNuevoStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-plantilla-detalle>
      <ui-encabezado-pagina
        encabezado
        titulo="Nuevo pedido"
        descripcion="Elige productos y cantidades. El pedido se guarda como borrador; el inventario se descuenta al confirmarlo."
        regresarA="/pedidos"
        textoRegreso="Pedidos"
      />

      <div principal class="flex flex-col gap-4">
        @if (store.errorProductos(); as error) {
          <ui-alerta tono="error" titulo="No se pudo cargar el catálogo">
            {{ error.message }}
            <button uiBoton type="button" tamano="sm" class="mt-2" (click)="store.cargarProductos()">
              Reintentar
            </button>
          </ui-alerta>
        } @else if (store.cargandoProductos() && store.productos().length === 0) {
          <div class="flex items-center gap-2 py-10 text-tinta-suave"><ui-spinner /> Cargando productos</div>
        } @else {
          <app-catalogo-pedido
            [productos]="store.productos()"
            [enPedido]="store.cantidades()"
            (agregar)="agregar($event)"
          />
        }
      </div>

      <div lateral class="flex flex-col gap-4">
        @if (store.errorGuardado(); as error) {
          <ui-alerta tono="error" titulo="No se creó el pedido" [detalles]="error.detalles">
            {{ error.message }}
          </ui-alerta>
        }
        <app-resumen-pedido
          [carrito]="store.carrito()"
          [guardando]="store.guardando()"
          (cambiarCantidad)="store.cambiarCantidad($event.idProducto, $event.cantidad)"
          (quitar)="store.quitar($event)"
          (vaciar)="store.vaciar()"
          (crear)="crear()"
        />
      </div>
    </ui-plantilla-detalle>
  `,
})
export class PedidoNuevoPage implements OnInit {
  protected readonly store = inject(PedidoNuevoStore);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);

  ngOnInit(): void {
    this.store.cargarProductos();
  }

  protected agregar(producto: Producto): void {
    this.store.agregar(producto);
  }

  protected crear(): void {
    this.store.crear().subscribe({
      next: (pedido) => {
        this.notificaciones.exito(`Pedido ${pedido.folio} creado como borrador.`);
        void this.router.navigate(['/pedidos', pedido.id]);
      },
      error: () => {
        /* El store guarda el error y la página lo muestra */
      },
    });
  }
}
