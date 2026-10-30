import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Producto } from '@core/domain/models/producto.model';
import { ETIQUETA_ESTADO } from '@core/domain/rules/estado-pedido.rules';
import { BotonComponent, SpinnerComponent } from '@shared/ui/atoms';
import { AlertaComponent, EncabezadoPaginaComponent, EstadoVacioComponent } from '@shared/ui/molecules';
import { PlantillaDetalleComponent } from '@shared/ui/templates';
import { NotificacionService } from '@shared/ui/services';
import { CatalogoPedidoComponent } from '../ui/organisms/catalogo-pedido.component';
import { ResumenPedidoComponent } from '../ui/organisms/resumen-pedido.component';
import { PedidoFormularioStore } from '../state/pedido-formulario.store';

/**
 * Página: captura (CU-04, /pedidos/nuevo) y edición de un borrador (CU-10, /pedidos/:id/editar).
 * Catálogo a la izquierda, resumen fijo a la derecha.
 * Usa GET /api/productos/activos, GET /api/pedidos/{id}, POST /api/pedidos y PUT /api/pedidos/{id}.
 */
@Component({
  selector: 'app-pedido-formulario-page',
  imports: [
    RouterLink,
    BotonComponent,
    SpinnerComponent,
    AlertaComponent,
    EncabezadoPaginaComponent,
    EstadoVacioComponent,
    PlantillaDetalleComponent,
    CatalogoPedidoComponent,
    ResumenPedidoComponent,
  ],
  providers: [PedidoFormularioStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (store.errorCarga(); as error) {
      @if (error.tipo === 'NO_ENCONTRADO' && esEdicion()) {
        <ui-estado-vacio icono="pedido" titulo="Este pedido no existe" [descripcion]="error.message">
          <a uiBoton routerLink="/pedidos">Ver pedidos</a>
        </ui-estado-vacio>
      } @else {
        <ui-alerta tono="error" titulo="No se pudo cargar la información">
          {{ error.message }}
          <button uiBoton type="button" tamano="sm" class="mt-2" (click)="cargar()">Reintentar</button>
        </ui-alerta>
      }
    } @else if (store.cargando() && store.productos().length === 0) {
      <div class="flex items-center justify-center gap-2 py-16 text-tinta-suave">
        <ui-spinner /> Cargando
      </div>
    } @else if (store.noEditable()) {
      <ui-estado-vacio
        icono="pedido"
        [titulo]="'El pedido ' + store.pedido()!.folio + ' ya no se puede editar'"
        [descripcion]="
          'Está ' + estadoActual() + '. Solo los pedidos en borrador admiten cambios en sus partidas.'
        "
      >
        <a uiBoton variante="primario" [routerLink]="['/pedidos', store.pedido()!.id]">Ver pedido</a>
      </ui-estado-vacio>
    } @else {
      <ui-plantilla-detalle>
        <ui-encabezado-pagina
          encabezado
          [titulo]="titulo()"
          [descripcion]="
            esEdicion()
              ? 'Agrega, quita o cambia cantidades. Al guardar, todas las partidas toman el precio vigente del catálogo. El inventario no cambia.'
              : 'Elige productos y cantidades. El pedido se guarda como borrador; el inventario se descuenta al confirmarlo.'
          "
          [regresarA]="esEdicion() ? '/pedidos/' + id() : '/pedidos'"
          [textoRegreso]="esEdicion() ? 'Volver al pedido' : 'Pedidos'"
        />

        <div principal class="flex flex-col gap-4">
          @if (store.partidasRetiradas().length > 0) {
            <ui-alerta
              tono="aviso"
              titulo="Se quitaron productos que ya no están activos"
              [detalles]="store.partidasRetiradas()"
            >
              No se pueden incluir en el pedido. Si guardas, el pedido quedará sin ellos.
            </ui-alerta>
          }
          <app-catalogo-pedido
            [productos]="store.productos()"
            [enPedido]="store.cantidades()"
            (agregar)="agregar($event)"
          />
        </div>

        <div lateral class="flex flex-col gap-4">
          @if (store.errorGuardado(); as error) {
            <ui-alerta
              tono="error"
              [titulo]="esEdicion() ? 'No se guardaron los cambios' : 'No se creó el pedido'"
              [detalles]="error.detalles"
            >
              {{ error.message }}
            </ui-alerta>
          }
          <app-resumen-pedido
            [carrito]="store.carrito()"
            [guardando]="store.guardando()"
            [textoGuardar]="esEdicion() ? 'Guardar cambios' : 'Crear pedido'"
            [notaGuardar]="
              esEdicion()
                ? 'Sigue en borrador. Para descontar el inventario confírmalo desde el detalle.'
                : 'Se guarda como borrador. El inventario se descuenta hasta que lo confirmes.'
            "
            (cambiarCantidad)="store.cambiarCantidad($event.idProducto, $event.cantidad)"
            (quitar)="store.quitar($event)"
            (vaciar)="store.vaciar()"
            (guardar)="guardar()"
          />
        </div>
      </ui-plantilla-detalle>
    }
  `,
})
export class PedidoFormularioPage {
  protected readonly store = inject(PedidoFormularioStore);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);

  /** Parámetro de ruta :id (solo en edición). */
  readonly id = input<string>();
  protected readonly esEdicion = computed(() => !!this.id());
  protected readonly titulo = computed(() => {
    const p = this.store.pedido();
    if (!this.esEdicion()) return 'Nuevo pedido';
    return p ? `Editar pedido ${p.folio}` : 'Editar pedido';
  });
  protected readonly estadoActual = computed(() => {
    const p = this.store.pedido();
    return p ? ETIQUETA_ESTADO[p.estado].toLowerCase() : '';
  });

  constructor() {
    effect(() => {
      this.id();
      untracked(() => this.cargar());
    });
  }

  protected cargar(): void {
    const id = Number(this.id());
    this.store.cargar(id > 0 ? id : null);
  }

  protected agregar(producto: Producto): void {
    this.store.agregar(producto);
  }

  protected guardar(): void {
    const edicion = this.esEdicion();
    this.store.guardar().subscribe({
      next: (pedido) => {
        this.notificaciones.exito(
          edicion
            ? `Cambios guardados en el pedido ${pedido.folio}.`
            : `Pedido ${pedido.folio} creado como borrador.`,
        );
        void this.router.navigate(['/pedidos', pedido.id]);
      },
      error: () => {
        /* El store guarda el error y la página lo muestra */
      },
    });
  }
}
