import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EtiquetaDirective } from '../atoms';

/**
 * Molécula: etiqueta + control + ayuda + error. El control se proyecta con <ng-content>,
 * así sirve igual para input, select o textarea.
 */
@Component({
  selector: 'ui-campo-formulario',
  imports: [EtiquetaDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-1.5' },
  template: `
    <label uiEtiqueta [attr.for]="paraId()">
      {{ etiqueta() }}
      @if (opcional()) {
        <span class="font-normal text-tinta-suave">(opcional)</span>
      }
    </label>
    <ng-content />
    @if (error()) {
      <p class="text-sm text-cancelado" [id]="paraId() + '-error'" role="alert">{{ error() }}</p>
    } @else if (ayuda()) {
      <p class="text-sm text-tinta-suave" [id]="paraId() + '-ayuda'">{{ ayuda() }}</p>
    }
  `,
})
export class CampoFormularioComponent {
  readonly etiqueta = input.required<string>();
  readonly paraId = input.required<string>();
  readonly ayuda = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly opcional = input(false);
}
