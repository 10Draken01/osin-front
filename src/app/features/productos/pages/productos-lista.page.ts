import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Producto } from '@core/domain/models/producto.model';
import { AppError } from '@core/domain/errors/app-error';
import { BotonComponent, IconoComponent, SpinnerComponent } from '@shared/ui/atoms';
import {
  AlertaComponent,
  EncabezadoPaginaComponent,
  EstadoVacioComponent,
  PaginadorComponent,
} from '@shared/ui/molecules';
import { PlantillaListadoComponent } from '@shared/ui/templates';
import { DialogoService, NotificacionService } from '@shared/ui/services';
import { TablaProductosComponent } from '../ui/organisms/tabla-productos.component';
import { ProductosListaStore } from '../state/productos-lista.store';

/**
 * Página (contenedor): catálogo completo con activos e inactivos.
 * Cubre GET /api/productos y PATCH /api/productos/{id}/activar|desactivar.
 */
@Component({
  selector: 'app-productos-lista-page',
  imports: [
    RouterLink,
    BotonComponent,
    IconoComponent,
    SpinnerComponent,
    AlertaComponent,
    EncabezadoPaginaComponent,
    EstadoVacioComponent,
    PaginadorComponent,
    PlantillaListadoComponent,
    TablaProductosComponent,
  ],
  providers: [ProductosListaStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-plantilla-listado>
      <ui-encabezado-pagina
        encabezado
        titulo="Productos"
        descripcion="Precios y existencias del catálogo. Un producto inactivo no aparece al capturar pedidos, pero se conserva en los pedidos que ya lo incluyen."
      >
        <a uiBoton acciones variante="primario" routerLink="/productos/nuevo">
          <ui-icono nombre="mas" [tamano]="16" />
          Nuevo producto
        </a>
      </ui-encabezado-pagina>

      @if (store.error(); as error) {
        <ui-alerta tono="error" titulo="No se pudo cargar el catálogo">
          {{ error.message }}
          <button uiBoton type="button" tamano="sm" class="mt-2" (click)="store.recargar()">
            Reintentar
          </button>
        </ui-alerta>
      }

      @if (store.pagina(); as pagina) {
        @if (pagina.elementos.length > 0) {
          <app-tabla-productos
            [productos]="pagina.elementos"
            [procesandoId]="store.procesandoId()"
            [class.opacity-60]="store.cargando()"
            (alternar)="alternar($event)"
          />
        } @else {
          <ui-estado-vacio
            titulo="Todavía no hay productos"
            descripcion="Registra el primer producto para poder capturar pedidos."
          >
            <a uiBoton variante="primario" routerLink="/productos/nuevo">Nuevo producto</a>
          </ui-estado-vacio>
        }
      } @else if (store.cargando()) {
        <div class="flex items-center justify-center gap-2 py-16 text-tinta-suave">
          <ui-spinner /> Cargando productos
        </div>
      }

      @if (store.pagina(); as pagina) {
        <ui-paginador pie [pagina]="pagina" (cambiar)="irAPagina($event)" />
      }
    </ui-plantilla-listado>
  `,
})
export class ProductosListaPage {
  protected readonly store = inject(ProductosListaStore);
  private readonly router = inject(Router);
  private readonly dialogo = inject(DialogoService);
  private readonly notificaciones = inject(NotificacionService);

  /** Query param ?pagina= (base 1 en la URL para que sea legible). */
  readonly pagina = input<string>();

  constructor() {
    effect(() => {
      const numero = Math.max(1, Number(this.pagina()) || 1) - 1;
      untracked(() => this.store.cargar(numero));
    });
  }

  protected irAPagina(numero: number): void {
    void this.router.navigate([], { queryParams: { pagina: numero + 1 } });
  }

  protected async alternar(producto: Producto): Promise<void> {
    if (producto.activo) {
      const aceptado = await this.dialogo.confirmar({
        titulo: `Desactivar ${producto.nombre}`,
        mensaje: 'El producto dejará de aparecer al capturar pedidos nuevos.',
        consecuencia:
          'Los pedidos que ya lo incluyen no cambian. Puedes volver a activarlo cuando quieras.',
        textoConfirmar: 'Desactivar',
        peligro: true,
      });
      if (!aceptado) return;
    }
    try {
      await this.store.alternarDisponibilidad(producto);
      this.notificaciones.exito(
        `${producto.nombre} ${producto.activo ? 'desactivado' : 'activado'}.`,
      );
    } catch (e) {
      this.notificaciones.error(AppError.desde(e).message);
      this.store.recargar();
    }
  }
}
