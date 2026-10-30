import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Plantilla de detalle/captura: columna principal amplia y columna lateral
 * (resumen o acciones). En pantallas angostas la lateral baja debajo de la principal.
 */
@Component({
  selector: 'ui-plantilla-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    <ng-content select="[encabezado]" />
    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div class="flex min-w-0 flex-col gap-6"><ng-content select="[principal]" /></div>
      <aside class="flex min-w-0 flex-col gap-6 lg:sticky lg:top-8">
        <ng-content select="[lateral]" />
      </aside>
    </div>
  `,
})
export class PlantillaDetalleComponent {}
