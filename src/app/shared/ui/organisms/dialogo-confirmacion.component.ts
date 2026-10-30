import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { BotonComponent } from '../atoms';
import { DialogoService } from '../services/dialogo.service';

/**
 * Organismo: diálogo modal de confirmación. Usa <dialog> nativo con showModal():
 * el navegador se encarga del foco atrapado, la tecla Esc y el fondo inerte.
 */
@Component({
  selector: 'ui-dialogo-confirmacion',
  imports: [BotonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog
      #dialogo
      class="m-auto w-[min(28rem,calc(100%-2rem))] rounded-lg border border-linea bg-superficie p-0 text-tinta shadow-xl backdrop:bg-tinta/40"
      aria-labelledby="dialogo-titulo"
      (cancel)="$event.preventDefault(); servicio.responder(false)"
    >
      @if (servicio.abierto(); as d) {
        <div class="space-y-3 p-5">
          <h2 id="dialogo-titulo" class="text-lg font-semibold">{{ d.titulo }}</h2>
          <p>{{ d.mensaje }}</p>
          @if (d.consecuencia) {
            <p class="rounded-md bg-papel p-3 text-sm text-tinta-suave">{{ d.consecuencia }}</p>
          }
        </div>
        <div class="flex justify-end gap-2 border-t border-linea px-5 py-3">
          <button uiBoton type="button" (click)="servicio.responder(false)">
            {{ d.textoCancelar ?? 'Volver' }}
          </button>
          <button
            uiBoton
            type="button"
            [variante]="d.peligro ? 'peligro' : 'primario'"
            (click)="servicio.responder(true)"
          >
            {{ d.textoConfirmar }}
          </button>
        </div>
      }
    </dialog>
  `,
})
export class DialogoConfirmacionComponent {
  protected readonly servicio = inject(DialogoService);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    effect(() => {
      const el = this.dialogo().nativeElement;
      const abierto = this.servicio.abierto() !== null;
      if (abierto && !el.open) el.showModal();
      if (!abierto && el.open) el.close();
    });
  }
}
