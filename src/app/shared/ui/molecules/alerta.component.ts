import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconoComponent, NombreIcono } from '../atoms';

export type TonoAlerta = 'error' | 'aviso' | 'info' | 'exito';

const ESTILO: Record<TonoAlerta, { clases: string; icono: NombreIcono }> = {
  error: { clases: 'border-cancelado/30 bg-cancelado-suave text-cancelado', icono: 'alerta' },
  aviso: { clases: 'border-aviso/30 bg-aviso-suave text-aviso', icono: 'alerta' },
  info: { clases: 'border-confirmado/30 bg-confirmado-suave text-confirmado', icono: 'info' },
  exito: { clases: 'border-completado/30 bg-completado-suave text-completado', icono: 'check' },
};

/** Molécula: mensaje en línea con título opcional y lista de detalles (p. ej. errores del ProblemDetail). */
@Component({
  selector: 'ui-alerta',
  imports: [IconoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"flex gap-3 rounded-md border p-3 text-sm " + estilo().clases',
    '[attr.role]': 'tono() === "error" ? "alert" : "status"',
  },
  template: `
    <ui-icono [nombre]="estilo().icono" class="mt-0.5" />
    <div class="min-w-0 space-y-1">
      @if (titulo()) {
        <p class="font-semibold">{{ titulo() }}</p>
      }
      <div class="text-tinta"><ng-content /></div>
      @if (detalles().length > 0) {
        <ul class="list-disc space-y-0.5 pl-4 text-tinta">
          @for (d of detalles(); track $index) {
            <li>{{ d }}</li>
          }
        </ul>
      }
    </div>
  `,
})
export class AlertaComponent {
  readonly tono = input<TonoAlerta>('info');
  readonly titulo = input<string | null>(null);
  readonly detalles = input<readonly string[]>([]);
  protected readonly estilo = computed(() => ESTILO[this.tono()]);
}
