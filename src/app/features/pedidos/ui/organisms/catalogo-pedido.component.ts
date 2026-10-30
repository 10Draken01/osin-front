import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Producto } from '@core/domain/models/producto.model';
import { BotonComponent, CampoDirective, IconoComponent, InsigniaComponent } from '@shared/ui/atoms';
import { EstadoVacioComponent } from '@shared/ui/molecules';

/**
 * Organismo: catálogo de productos activos para armar el pedido.
 * Búsqueda local (la API devuelve todos los activos en una sola lista).
 */
@Component({
  selector: 'app-catalogo-pedido',
  imports: [CurrencyPipe, BotonComponent, CampoDirective, IconoComponent, InsigniaComponent, EstadoVacioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block rounded-lg border border-linea bg-superficie' },
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-linea p-4">
      <h2 class="font-semibold">Productos disponibles</h2>
      <div class="relative w-full sm:w-64">
        <ui-icono nombre="buscar" [tamano]="16" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-tinta-suave" />
        <input
          uiCampo
          type="search"
          class="pl-9"
          placeholder="Buscar producto"
          aria-label="Buscar producto"
          [value]="busqueda()"
          (input)="busqueda.set($any($event.target).value)"
        />
      </div>
    </div>

    @if (filtrados().length === 0) {
      <ui-estado-vacio
        [titulo]="productos().length === 0 ? 'No hay productos activos' : 'Sin coincidencias'"
        [descripcion]="
          productos().length === 0
            ? 'Activa o registra productos en el catálogo para poder capturar pedidos.'
            : 'Prueba con otra palabra del nombre o la descripción.'
        "
      />
    } @else {
      <ul class="divide-y divide-linea">
        @for (p of filtrados(); track p.id) {
          <li class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <div class="min-w-0 flex-1">
              <p class="font-medium">{{ p.nombre }}</p>
              <p class="cifra flex flex-wrap items-center gap-x-3 text-sm text-tinta-suave">
                <span>{{ p.precioUnitario | currency: 'MXN' : 'symbol-narrow' }}</span>
                @if (p.existencia > 0) {
                  <span>{{ p.existencia }} en existencia</span>
                } @else {
                  <ui-insignia tono="aviso">Sin existencia</ui-insignia>
                }
              </p>
            </div>
            <button
              uiBoton
              type="button"
              tamano="sm"
              [variante]="cantidadEnPedido(p.id) > 0 ? 'secundario' : 'primario'"
              [attr.aria-label]="'Agregar ' + p.nombre + ' al pedido'"
              (click)="agregar.emit(p)"
            >
              <ui-icono nombre="mas" [tamano]="16" />
              @if (cantidadEnPedido(p.id) > 0) {
                Agregar otra ({{ cantidadEnPedido(p.id) }})
              } @else {
                Agregar
              }
            </button>
          </li>
        }
      </ul>
    }
  `,
})
export class CatalogoPedidoComponent {
  readonly productos = input.required<readonly Producto[]>();
  /** Cantidad ya agregada por id de producto. */
  readonly enPedido = input<ReadonlyMap<number, number>>(new Map());
  readonly agregar = output<Producto>();

  protected readonly busqueda = signal('');
  protected readonly filtrados = computed(() => {
    const termino = normalizar(this.busqueda());
    if (!termino) return this.productos();
    return this.productos().filter((p) =>
      normalizar(`${p.nombre} ${p.descripcion ?? ''}`).includes(termino),
    );
  });

  protected cantidadEnPedido(id: number): number {
    return this.enPedido().get(id) ?? 0;
  }
}

/** Sin acentos ni mayúsculas: "cafe" encuentra "Café". */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
