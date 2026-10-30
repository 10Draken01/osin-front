import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconoComponent } from '../atoms';

/**
 * Molécula: − [cantidad] +. Solo enteros >= 1 (el backend vende por pieza).
 * No limita por existencia: un pedido en borrador puede pedir más de lo disponible;
 * el aviso se muestra en el resumen y la regla la aplica el servidor al confirmar.
 */
@Component({
  selector: 'ui-selector-cantidad',
  imports: [IconoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex h-9 items-stretch overflow-hidden rounded-md border border-linea-fuerte bg-superficie',
  },
  template: `
    <button
      type="button"
      class="px-2 text-tinta-suave hover:bg-papel disabled:opacity-40"
      [disabled]="valor() <= 1"
      [attr.aria-label]="'Quitar una pieza de ' + nombre()"
      (click)="cambio.emit(valor() - 1)"
    >
      <ui-icono nombre="menos" [tamano]="16" />
    </button>
    <input
      type="number"
      inputmode="numeric"
      min="1"
      step="1"
      class="cifra w-14 border-x border-linea text-center focus:outline-none"
      [value]="valor()"
      [attr.aria-label]="'Cantidad de ' + nombre()"
      (change)="alEscribir($event)"
    />
    <button
      type="button"
      class="px-2 text-tinta-suave hover:bg-papel"
      [attr.aria-label]="'Agregar una pieza de ' + nombre()"
      (click)="cambio.emit(valor() + 1)"
    >
      <ui-icono nombre="mas" [tamano]="16" />
    </button>
  `,
})
export class SelectorCantidadComponent {
  readonly valor = input.required<number>();
  readonly nombre = input('');
  readonly cambio = output<number>();

  protected alEscribir(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const numero = Math.trunc(Number(campo.value));
    const valido = Number.isFinite(numero) && numero >= 1 ? numero : 1;
    campo.value = String(valido);
    this.cambio.emit(valido);
  }
}
