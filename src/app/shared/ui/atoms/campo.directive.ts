import { Directive, input } from '@angular/core';

/**
 * Átomo de captura. Directiva (no componente) para que <input>, <select> y <textarea>
 * sigan funcionando con formularios reactivos sin ControlValueAccessor propio.
 */
@Directive({
  selector: 'input[uiCampo], select[uiCampo], textarea[uiCampo]',
  host: {
    class:
      'block w-full rounded-md border border-linea-fuerte bg-superficie px-3 py-2 text-tinta ' +
      'placeholder:text-tinta-suave/70 focus:border-marca focus:outline-none focus:ring-2 ' +
      'focus:ring-marca/25 disabled:bg-papel aria-[invalid=true]:border-cancelado',
    '[attr.aria-invalid]': 'invalido() ? "true" : null',
  },
})
export class CampoDirective {
  readonly invalido = input(false);
}
