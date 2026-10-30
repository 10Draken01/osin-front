import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IconoComponent, NombreIcono } from '../atoms';
import { NotificacionService, TonoNotificacion } from '../services/notificacion.service';

const ESTILO: Record<TonoNotificacion, { clases: string; icono: NombreIcono }> = {
  exito: { clases: 'border-l-completado', icono: 'check' },
  error: { clases: 'border-l-cancelado', icono: 'alerta' },
  info: { clases: 'border-l-confirmado', icono: 'info' },
};

/** Organismo: pila de avisos en la esquina inferior. Se monta una sola vez en el layout. */
@Component({
  selector: 'ui-notificaciones',
  imports: [IconoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-96',
    'aria-live': 'polite',
  },
  template: `
    @for (n of servicio.notificaciones(); track n.id) {
      <div
        class="pointer-events-auto flex w-full items-start gap-3 rounded-md border border-l-4 border-linea bg-superficie p-3 text-sm shadow-lg"
        [class]="estilo[n.tono].clases"
        [attr.role]="n.tono === 'error' ? 'alert' : 'status'"
      >
        <ui-icono [nombre]="estilo[n.tono].icono" class="mt-0.5" />
        <p class="flex-1">{{ n.mensaje }}</p>
        <button
          type="button"
          class="text-tinta-suave hover:text-tinta"
          aria-label="Cerrar aviso"
          (click)="servicio.descartar(n.id)"
        >
          <ui-icono nombre="cerrar" [tamano]="16" />
        </button>
      </div>
    }
  `,
})
export class NotificacionesComponent {
  protected readonly servicio = inject(NotificacionService);
  protected readonly estilo = ESTILO;
}
