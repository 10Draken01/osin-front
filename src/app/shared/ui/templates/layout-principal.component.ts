import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {
  DialogoConfirmacionComponent,
  NavegacionPrincipalComponent,
  NotificacionesComponent,
} from '../organisms';

/**
 * Plantilla raíz: barra lateral en escritorio, barra superior en móvil.
 * Aquí se montan una sola vez los organismos globales (avisos y diálogo).
 */
@Component({
  selector: 'ui-layout-principal',
  imports: [
    RouterOutlet,
    RouterLink,
    NavegacionPrincipalComponent,
    NotificacionesComponent,
    DialogoConfirmacionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-h-dvh md:grid md:grid-cols-[15rem_1fr]' },
  template: `
    <a
      href="#contenido"
      class="sr-only z-50 rounded bg-superficie px-3 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >Saltar al contenido</a
    >
    <header
      class="sticky top-0 z-30 flex flex-col gap-3 bg-tinta px-4 py-3 md:h-dvh md:gap-8 md:px-4 md:py-6"
    >
      <a routerLink="/pedidos" class="flex items-baseline gap-2 px-3 text-white">
        <span class="text-lg font-bold tracking-tight">OSIN</span>
        <span class="text-sm text-white/60">Pedidos e inventario</span>
      </a>
      <ui-navegacion-principal class="-mx-1 overflow-x-auto md:mx-0" />
    </header>

    <main id="contenido" class="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div class="mx-auto max-w-6xl">
        <router-outlet />
      </div>
    </main>

    <ui-notificaciones />
    <ui-dialogo-confirmacion />
  `,
})
export class LayoutPrincipalComponent {}
