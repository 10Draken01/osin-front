import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconoComponent, NombreIcono } from '../atoms';

/** Molécula: pantalla vacía que indica qué hacer a continuación (la acción va proyectada). */
@Component({
  selector: 'ui-estado-vacio',
  imports: [IconoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col items-center gap-3 px-6 py-12 text-center' },
  template: `
    <span class="grid size-12 place-items-center rounded-full bg-papel text-tinta-suave">
      <ui-icono [nombre]="icono()" [tamano]="22" />
    </span>
    <div class="max-w-sm space-y-1">
      <p class="font-semibold">{{ titulo() }}</p>
      @if (descripcion()) {
        <p class="text-sm text-tinta-suave">{{ descripcion() }}</p>
      }
    </div>
    <ng-content />
  `,
})
export class EstadoVacioComponent {
  readonly titulo = input.required<string>();
  readonly descripcion = input<string | null>(null);
  readonly icono = input<NombreIcono>('caja');
}
