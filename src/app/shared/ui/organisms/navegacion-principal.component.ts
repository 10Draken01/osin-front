import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconoComponent, NombreIcono } from '../atoms';

interface EnlaceNavegacion {
  readonly ruta: string;
  readonly texto: string;
  readonly icono: NombreIcono;
  readonly exacto: boolean;
}

/**
 * Organismo: navegación principal. Solo tres destinos, ordenados por frecuencia de uso
 * del operador: revisar pedidos, capturar uno nuevo y administrar el catálogo.
 */
@Component({
  selector: 'ui-navegacion-principal',
  imports: [RouterLink, RouterLinkActive, IconoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <nav aria-label="Principal">
      <ul class="flex gap-1 md:flex-col">
        @for (e of enlaces; track e.ruta) {
          <li>
            <a
              [routerLink]="e.ruta"
              routerLinkActive="bg-white/10 text-white"
              [routerLinkActiveOptions]="{ exact: e.exacto }"
              ariaCurrentWhenActive="page"
              class="flex items-center gap-2.5 rounded-md px-3 py-2 whitespace-nowrap text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white"
            >
              <ui-icono [nombre]="e.icono" />
              <span>{{ e.texto }}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
})
export class NavegacionPrincipalComponent {
  protected readonly enlaces: readonly EnlaceNavegacion[] = [
    { ruta: '/pedidos', texto: 'Pedidos', icono: 'pedido', exacto: true },
    { ruta: '/pedidos/nuevo', texto: 'Nuevo pedido', icono: 'carrito', exacto: true },
    { ruta: '/productos', texto: 'Productos', icono: 'caja', exacto: false },
  ];
}
