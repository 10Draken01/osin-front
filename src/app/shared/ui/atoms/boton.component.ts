import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SpinnerComponent } from './spinner.component';

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'peligro-borde' | 'fantasma';
export type TamanoBoton = 'sm' | 'md';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap ' +
  'transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTES: Record<VarianteBoton, string> = {
  primario: 'bg-marca text-white hover:bg-marca-oscura',
  secundario: 'border border-linea-fuerte bg-superficie text-tinta hover:bg-papel',
  peligro: 'bg-cancelado text-white hover:brightness-90',
  'peligro-borde': 'border border-cancelado/40 bg-superficie text-cancelado hover:bg-cancelado-suave',
  fantasma: 'text-tinta-suave hover:bg-tinta/5 hover:text-tinta',
};

const TAMANOS: Record<TamanoBoton, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-[0.9375rem]',
};

/**
 * Átomo botón. Se aplica como atributo sobre <button> o <a> para conservar la semántica nativa
 * (teclado, foco, lectores de pantalla) en lugar de envolver el elemento.
 */
@Component({
  selector: 'button[uiBoton], a[uiBoton]',
  imports: [SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'clases()',
    '[attr.aria-busy]': 'cargando() || null',
    '[attr.disabled]': 'cargando() || deshabilitado() ? "" : null',
  },
  template: `
    @if (cargando()) {
      <ui-spinner [tamano]="14" etiqueta="Procesando" />
    }
    <ng-content />
  `,
})
export class BotonComponent {
  readonly variante = input<VarianteBoton>('secundario');
  readonly tamano = input<TamanoBoton>('md');
  /** Mientras es true el botón se deshabilita: evita el doble clic que el backend rechazaría con 409. */
  readonly cargando = input(false);
  readonly deshabilitado = input(false);

  protected readonly clases = computed(
    () => `${BASE} ${VARIANTES[this.variante()]} ${TAMANOS[this.tamano()]}`,
  );
}
