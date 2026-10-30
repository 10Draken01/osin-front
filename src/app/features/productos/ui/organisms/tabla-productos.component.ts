import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Producto } from '@core/domain/models/producto.model';
import { BotonComponent, IconoComponent, InsigniaComponent } from '@shared/ui/atoms';

/**
 * Organismo: tabla del catálogo. Presentacional: recibe datos y emite intenciones.
 * Editar es un enlace (navegación); activar/desactivar es un evento (mutación).
 */
@Component({
  selector: 'app-tabla-productos',
  imports: [CurrencyPipe, RouterLink, BotonComponent, IconoComponent, InsigniaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block overflow-x-auto' },
  template: `
    <table class="w-full min-w-[44rem] text-left text-sm">
      <caption class="sr-only">Productos del catálogo</caption>
      <thead class="border-b border-linea bg-papel/60 text-tinta-suave">
        <tr>
          <th scope="col" class="px-4 py-2.5 font-medium">Producto</th>
          <th scope="col" class="px-4 py-2.5 text-right font-medium">Precio</th>
          <th scope="col" class="px-4 py-2.5 text-right font-medium">Existencia</th>
          <th scope="col" class="px-4 py-2.5 font-medium">Disponibilidad</th>
          <th scope="col" class="px-4 py-2.5"><span class="sr-only">Acciones</span></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-linea">
        @for (p of productos(); track p.id) {
          <tr [class.text-tinta-suave]="!p.activo">
            <td class="max-w-sm px-4 py-3">
              <p class="font-medium" [class.text-tinta]="p.activo">{{ p.nombre }}</p>
              @if (p.descripcion) {
                <p class="truncate text-tinta-suave">{{ p.descripcion }}</p>
              }
            </td>
            <td class="cifra px-4 py-3 text-right">
              {{ p.precioUnitario | currency: 'MXN' : 'symbol-narrow' }}
            </td>
            <td class="cifra px-4 py-3 text-right">
              @if (p.existencia === 0) {
                <ui-insignia tono="aviso">Agotado</ui-insignia>
              } @else {
                {{ p.existencia }}
              }
            </td>
            <td class="px-4 py-3">
              <ui-insignia [tono]="p.activo ? 'exito' : 'neutro'">
                {{ p.activo ? 'Activo' : 'Inactivo' }}
              </ui-insignia>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-1">
                <a uiBoton variante="fantasma" tamano="sm" [routerLink]="['/productos', p.id, 'editar']">
                  <ui-icono nombre="editar" [tamano]="16" />
                  Editar
                </a>
                <button
                  uiBoton
                  type="button"
                  variante="fantasma"
                  tamano="sm"
                  [cargando]="procesandoId() === p.id"
                  [deshabilitado]="procesandoId() !== null"
                  (click)="alternar.emit(p)"
                >
                  @if (procesandoId() !== p.id) {
                    <ui-icono nombre="encender" [tamano]="16" />
                  }
                  {{ p.activo ? 'Desactivar' : 'Activar' }}
                </button>
              </div>
            </td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class TablaProductosComponent {
  readonly productos = input.required<readonly Producto[]>();
  /** Producto con una petición en curso; bloquea los demás botones para evitar choques. */
  readonly procesandoId = input<number | null>(null);
  readonly alternar = output<Producto>();
}
