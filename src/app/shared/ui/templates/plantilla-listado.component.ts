import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Plantilla de listados: encabezado, filtros, contenido (tabla) y pie (paginación).
 * Solo define la distribución; el contenido llega por proyección con atributos.
 */
@Component({
  selector: 'ui-plantilla-listado',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col gap-6' },
  template: `
    <ng-content select="[encabezado]" />
    <ng-content select="[filtros]" />
    <section class="overflow-hidden rounded-lg border border-linea bg-superficie">
      <ng-content />
    </section>
    <ng-content select="[pie]" />
  `,
})
export class PlantillaListadoComponent {}
