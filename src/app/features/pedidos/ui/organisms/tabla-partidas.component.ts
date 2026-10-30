import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { PartidaPedido } from '@core/domain/models/pedido.model';

/** Organismo: partidas del pedido con los importes que calculó el servidor (RF-05, RF-06, RF-12, RF-18). */
@Component({
  selector: 'app-tabla-partidas',
  imports: [CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block overflow-x-auto rounded-lg border border-linea bg-superficie' },
  template: `
    <table class="w-full min-w-[32rem] text-left text-sm">
      <caption class="border-b border-linea p-4 text-left font-semibold">Partidas</caption>
      <thead class="border-b border-linea bg-papel/60 text-tinta-suave">
        <tr>
          <th scope="col" class="px-4 py-2.5 font-medium">Producto</th>
          <th scope="col" class="px-4 py-2.5 text-right font-medium">Cantidad</th>
          <th scope="col" class="px-4 py-2.5 text-right font-medium">Precio unitario</th>
          <th scope="col" class="px-4 py-2.5 text-right font-medium">Subtotal</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-linea">
        @for (p of partidas(); track p.idProducto) {
          <tr>
            <td class="px-4 py-3 font-medium">{{ p.nombre }}</td>
            <td class="cifra px-4 py-3 text-right">{{ p.cantidad }}</td>
            <td class="cifra px-4 py-3 text-right">{{ p.precioUnitario | currency: 'MXN' : 'symbol-narrow' }}</td>
            <td class="cifra px-4 py-3 text-right">{{ p.subtotal | currency: 'MXN' : 'symbol-narrow' }}</td>
          </tr>
        }
      </tbody>
      <tfoot class="border-t border-linea-fuerte">
        <tr>
          <th scope="row" colspan="3" class="px-4 py-3 text-right font-semibold">Total</th>
          <td class="cifra px-4 py-3 text-right text-lg font-semibold">
            {{ total() | currency: 'MXN' : 'symbol-narrow' }}
          </td>
        </tr>
      </tfoot>
    </table>
    <p class="border-t border-linea px-4 py-2 text-xs text-tinta-suave">
      El precio unitario es el vigente al crear el pedido o al editarlo en borrador; una vez confirmado ya no cambia aunque se modifique el catálogo.
    </p>
  `,
})
export class TablaPartidasComponent {
  readonly partidas = input.required<readonly PartidaPedido[]>();
  readonly total = input.required<number>();
}
