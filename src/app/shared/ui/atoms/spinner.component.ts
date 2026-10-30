import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex', role: 'status' },
  template: `
    <span
      class="inline-block animate-spin rounded-full border-2 border-current border-r-transparent"
      [style.width.px]="tamano()"
      [style.height.px]="tamano()"
    ></span>
    <span class="sr-only">{{ etiqueta() }}</span>
  `,
})
export class SpinnerComponent {
  readonly tamano = input(16);
  readonly etiqueta = input('Cargando');
}
