import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  Carrito,
  lineasSinExistencia,
  subtotalEstimado,
  totalEstimado,
  totalPiezas,
} from '@core/domain/rules/carrito';
import { BotonComponent, IconoComponent } from '@shared/ui/atoms';
import { AlertaComponent, SelectorCantidadComponent } from '@shared/ui/molecules';

/**
 * Organismo: resumen del pedido en captura. Muestra el total estimado y advierte
 * qué partidas superan la existencia (se pueden guardar, pero no confirmar).
 */
@Component({
  selector: 'app-resumen-pedido',
  imports: [CurrencyPipe, BotonComponent, IconoComponent, AlertaComponent, SelectorCantidadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block rounded-lg border border-linea bg-superficie' },
  template: `
    <div class="flex items-center justify-between border-b border-linea p-4">
      <h2 class="font-semibold">Resumen del pedido</h2>
      @if (carrito().length > 0) {
        <button uiBoton type="button" variante="fantasma" tamano="sm" (click)="vaciar.emit()">
          Vaciar
        </button>
      }
    </div>

    @if (carrito().length === 0) {
      <p class="p-4 text-sm text-tinta-suave">
        Agrega productos del catálogo. Cada producto aparece una sola vez; ajusta aquí la cantidad. El pedido necesita al menos uno.
      </p>
    } @else {
      <ul class="divide-y divide-linea">
        @for (l of carrito(); track l.producto.id) {
          <li class="space-y-2 p-4">
            <div class="flex items-start justify-between gap-2">
              <p class="font-medium">{{ l.producto.nombre }}</p>
              <button
                type="button"
                class="text-tinta-suave hover:text-cancelado"
                [attr.aria-label]="'Quitar ' + l.producto.nombre"
                (click)="quitar.emit(l.producto.id)"
              >
                <ui-icono nombre="cerrar" [tamano]="16" />
              </button>
            </div>
            <div class="flex items-center justify-between gap-2">
              <ui-selector-cantidad
                [valor]="l.cantidad"
                [nombre]="l.producto.nombre"
                (cambio)="cambiarCantidad.emit({ idProducto: l.producto.id, cantidad: $event })"
              />
              <span class="cifra text-sm">{{ subtotal(l) | currency: 'MXN' : 'symbol-narrow' }}</span>
            </div>
            @if (l.cantidad > l.producto.existencia) {
              <p class="text-xs text-aviso">Solo hay {{ l.producto.existencia }} en existencia.</p>
            }
          </li>
        }
      </ul>

      <div class="space-y-3 border-t border-linea p-4">
        <div class="flex items-baseline justify-between">
          <span class="text-tinta-suave">{{ piezas() }} piezas</span>
          <span class="cifra text-xl font-semibold">{{ total() | currency: 'MXN' : 'symbol-narrow' }}</span>
        </div>
        <p class="text-xs text-tinta-suave">
          Total estimado con los precios actuales. El servidor calcula el importe definitivo.
        </p>

        @if (sinExistencia().length > 0) {
          <ui-alerta tono="aviso" titulo="No alcanza la existencia">
            Puedes guardar el borrador, pero no se podrá confirmar hasta que haya inventario.
          </ui-alerta>
        }

        <button
          uiBoton
          type="button"
          variante="primario"
          class="w-full"
          [cargando]="guardando()"
          (click)="guardar.emit()"
        >
          {{ textoGuardar() }}
        </button>
        <p class="text-xs text-tinta-suave">{{ notaGuardar() }}</p>
      </div>
    }
  `,
})
export class ResumenPedidoComponent {
  readonly carrito = input.required<Carrito>();
  readonly guardando = input(false);
  readonly cambiarCantidad = output<{ idProducto: number; cantidad: number }>();
  readonly quitar = output<number>();
  readonly vaciar = output<void>();
  readonly guardar = output<void>();
  /** Texto del botón: "Crear pedido" o "Guardar cambios" (mismo verbo que el aviso de éxito). */
  readonly textoGuardar = input('Crear pedido');
  readonly notaGuardar = input(
    'Se guarda como borrador. El inventario se descuenta hasta que lo confirmes.',
  );

  protected readonly subtotal = subtotalEstimado;
  protected readonly total = computed(() => totalEstimado(this.carrito()));
  protected readonly piezas = computed(() => totalPiezas(this.carrito()));
  protected readonly sinExistencia = computed(() => lineasSinExistencia(this.carrito()));
}
