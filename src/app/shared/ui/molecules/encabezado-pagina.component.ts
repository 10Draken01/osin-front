import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconoComponent } from '../atoms';

/** Molécula: título de la página, descripción breve, enlace de regreso y acciones principales. */
@Component({
  selector: 'ui-encabezado-pagina',
  imports: [RouterLink, IconoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (regresarA()) {
      <a
        [routerLink]="regresarA()"
        class="mb-3 inline-flex items-center gap-1 text-sm text-tinta-suave hover:text-tinta"
      >
        <ui-icono nombre="regresar" [tamano]="16" />
        {{ textoRegreso() }}
      </a>
    }
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="min-w-0 space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight text-tinta">
          <ng-content select="[titulo]" />{{ titulo() }}
        </h1>
        @if (descripcion()) {
          <p class="max-w-prose text-tinta-suave">{{ descripcion() }}</p>
        }
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <ng-content select="[acciones]" />
      </div>
    </div>
  `,
})
export class EncabezadoPaginaComponent {
  readonly titulo = input('');
  readonly descripcion = input<string | null>(null);
  readonly regresarA = input<string | null>(null);
  readonly textoRegreso = input('Regresar');
}
