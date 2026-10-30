import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Pedido } from '@core/domain/models/pedido.model';
import { EstadoPedidoInsigniaComponent } from '../molecules/estado-pedido-insignia.component';

/**
 * Organismo: listado de pedidos con folio, fecha, estado y total (RF-11).
 * El folio es el enlace al detalle; ahí están las acciones, para que nadie confirme
 * o cancele un pedido sin ver antes sus partidas.
 */
@Component({
  selector: 'app-tabla-pedidos',
  imports: [CurrencyPipe, DatePipe, RouterLink, EstadoPedidoInsigniaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block overflow-x-auto' },
  template: `
    <table class="w-full min-w-[40rem] text-left text-sm">
      <caption class="sr-only">Pedidos</caption>
      <thead class="border-b border-linea bg-papel/60 text-tinta-suave">
        <tr>
          <th scope="col" class="px-4 py-2.5 font-medium">Folio</th>
          <th scope="col" class="px-4 py-2.5 font-medium">Creado</th>
          <th scope="col" class="px-4 py-2.5 text-right font-medium">Partidas</th>
          <th scope="col" class="px-4 py-2.5 text-right font-medium">Total</th>
          <th scope="col" class="px-4 py-2.5 font-medium">Estado</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-linea">
        @for (p of pedidos(); track p.id) {
          <tr class="hover:bg-papel/50">
            <td class="px-4 py-3">
              <a
                [routerLink]="['/pedidos', p.id]"
                class="cifra font-semibold text-marca underline-offset-2 hover:underline"
              >
                {{ p.folio }}
              </a>
            </td>
            <td class="px-4 py-3 text-tinta-suave">
              {{ p.fechaCreacion | date: 'd MMM y, HH:mm' }}
            </td>
            <td class="cifra px-4 py-3 text-right">{{ p.partidas.length }}</td>
            <td class="cifra px-4 py-3 text-right font-medium">
              {{ p.total | currency: 'MXN' : 'symbol-narrow' }}
            </td>
            <td class="px-4 py-3"><ui-estado-pedido [estado]="p.estado" /></td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class TablaPedidosComponent {
  readonly pedidos = input.required<readonly Pedido[]>();
}
