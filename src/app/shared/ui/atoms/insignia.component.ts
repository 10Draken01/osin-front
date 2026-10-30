import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type TonoInsignia = 'neutro' | 'info' | 'exito' | 'peligro' | 'aviso';

const TONOS: Record<TonoInsignia, string> = {
  neutro: 'bg-borrador-suave text-borrador',
  info: 'bg-confirmado-suave text-confirmado',
  exito: 'bg-completado-suave text-completado',
  peligro: 'bg-cancelado-suave text-cancelado',
  aviso: 'bg-aviso-suave text-aviso',
};

@Component({
  selector: 'ui-insignia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'clases()' },
  template: `<ng-content />`,
})
export class InsigniaComponent {
  readonly tono = input<TonoInsignia>('neutro');
  protected readonly clases = computed(
    () =>
      `inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${TONOS[this.tono()]}`,
  );
}
