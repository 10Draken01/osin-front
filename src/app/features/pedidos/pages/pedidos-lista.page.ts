import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ESTADOS_PEDIDO, EstadoPedido, FiltroPedidos } from '@core/domain/models/pedido.model';
import { BotonComponent, IconoComponent, SpinnerComponent } from '@shared/ui/atoms';
import {
  AlertaComponent,
  EncabezadoPaginaComponent,
  EstadoVacioComponent,
  PaginadorComponent,
} from '@shared/ui/molecules';
import { PlantillaListadoComponent } from '@shared/ui/templates';
import { FiltrosPedidosComponent } from '../ui/organisms/filtros-pedidos.component';
import { TablaPedidosComponent } from '../ui/organisms/tabla-pedidos.component';
import { PedidosListaStore } from '../state/pedidos-lista.store';

/**
 * Página de inicio: listado de pedidos con filtros (CU-05, GET /api/pedidos).
 * Filtros y página viven en la URL (?estado=&folio=&pagina=) para poder compartir
 * o recargar la vista sin perderlos.
 */
@Component({
  selector: 'app-pedidos-lista-page',
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
    FiltrosPedidosComponent,
    TablaPedidosComponent,
  ],
  providers: [PedidosListaStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-plantilla-listado>
      <ui-encabezado-pagina
        encabezado
        titulo="Pedidos"
        descripcion="Del más reciente al más antiguo. Abre un folio para ver sus partidas y cambiar su estado."
      >
        <a uiBoton acciones variante="primario" routerLink="/pedidos/nuevo">
          <ui-icono nombre="mas" [tamano]="16" />
          Nuevo pedido
        </a>
      </ui-encabezado-pagina>

      <app-filtros-pedidos filtros [filtro]="filtro()" (filtrar)="filtrar($event)" />

      @if (store.error(); as error) {
        <ui-alerta tono="error" titulo="No se pudieron cargar los pedidos" [detalles]="error.detalles">
          {{ error.message }}
          <button uiBoton type="button" tamano="sm" class="mt-2" (click)="store.recargar()">Reintentar</button>
        </ui-alerta>
      }

      @if (store.pagina(); as pagina) {
        @if (pagina.elementos.length > 0) {
          <app-tabla-pedidos [pedidos]="pagina.elementos" [class.opacity-60]="store.cargando()" />
        } @else if (hayFiltros()) {
          <ui-estado-vacio
            icono="buscar"
            titulo="Ningún pedido coincide con los filtros"
            descripcion="Revisa el folio o elige otro estado."
          />
        } @else {
          <ui-estado-vacio
            icono="pedido"
            titulo="Aún no hay pedidos"
            descripcion="Captura el primero; se guardará como borrador hasta que lo confirmes."
          >
            <a uiBoton variante="primario" routerLink="/pedidos/nuevo">Nuevo pedido</a>
          </ui-estado-vacio>
        }
      } @else if (store.cargando()) {
        <div class="flex items-center justify-center gap-2 py-16 text-tinta-suave">
          <ui-spinner /> Cargando pedidos
        </div>
      }

      @if (store.pagina(); as pagina) {
        <ui-paginador pie [pagina]="pagina" (cambiar)="irAPagina($event)" />
      }
    </ui-plantilla-listado>
  `,
})
export class PedidosListaPage {
  protected readonly store = inject(PedidosListaStore);
  private readonly router = inject(Router);

  // Query params enlazados con withComponentInputBinding()
  readonly estado = input<string>();
  readonly folio = input<string>();
  readonly pagina = input<string>();

  protected readonly filtro = computed<FiltroPedidos>(() => ({
    estado: aEstado(this.estado()),
    folio: this.folio()?.trim() || null,
  }));
  protected readonly hayFiltros = computed(() => !!this.filtro().estado || !!this.filtro().folio);

  constructor() {
    effect(() => {
      const filtro = this.filtro();
      const numero = Math.max(1, Number(this.pagina()) || 1) - 1;
      untracked(() => this.store.cargar(filtro, numero));
    });
  }

  protected filtrar(f: FiltroPedidos): void {
    // Al cambiar filtros se vuelve a la primera página
    void this.router.navigate([], {
      queryParams: { estado: f.estado ?? null, folio: f.folio ?? null, pagina: null },
    });
  }

  protected irAPagina(numero: number): void {
    void this.router.navigate([], {
      queryParams: { pagina: numero + 1 },
      queryParamsHandling: 'merge',
    });
  }
}

/** Ignora valores inventados en la URL en lugar de mandar un estado que la API rechaza con 400. */
function aEstado(valor: string | undefined): EstadoPedido | null {
  return ESTADOS_PEDIDO.find((e) => e === valor?.toUpperCase()) ?? null;
}
