import { Directive } from '@angular/core';

@Directive({
  selector: 'label[uiEtiqueta]',
  host: { class: 'block text-sm font-medium text-tinta' },
})
export class EtiquetaDirective {}
