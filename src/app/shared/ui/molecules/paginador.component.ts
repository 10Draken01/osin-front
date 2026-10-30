import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BotonComponent, IconoComponent } from '../atoms';
import { Pagina } from '@core/domain/models/pagina.model';

/** Molécula: navegación entre páginas. Muestra la página en base 1; emite el número en base 0 (API). */
@Component({
  selector: 'ui-paginador',
  imports: [BotonComponent, IconoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-wrap items-center justify-between gap-3 text-sm' },
  template: `
    <p class="text-tinta-suave">
      {{ resumen() }}
    </p>
    @if (pagina().totalPaginas > 1) {
      <nav class="flex items-center gap-2" aria-label="Paginación">
        <button
          uiBoton
          type="button"
          tamano="sm"
          [deshabilitado]="esPrimera()"
          (click)="cambiar.emit(pagina().numero - 1)"
        >
          <ui-icono nombre="izquierda" [tamano]="16" />
          Anterior
        </button>
        <span class="cifra px-1 text-tinta" aria-live="polite">
          Página {{ pagina().numero + 1 }} de {{ pagina().totalPaginas }}
        </span>
        <button
          uiBoton
          type="button"
          tamano="sm"
          [deshabilitado]="esUltima()"
          (click)="cambiar.emit(pagina().numero + 1)"
        >
          Siguiente
          <ui-icono nombre="derecha" [tamano]="16" />
        </button>
      </nav>
    }
  `,
})
export class PaginadorComponent {
  readonly pagina = input.required<Pagina<unknown>>();
  readonly cambiar = output<number>();

  protected readonly esPrimera = computed(() => this.pagina().numero <= 0);
  protected readonly esUltima = computed(
    () => this.pagina().numero >= this.pagina().totalPaginas - 1,
  );
  protected readonly resumen = computed(() => {
    const p = this.pagina();
    if (p.totalElementos === 0) return 'Sin resultados';
    const desde = p.numero * p.tamano + 1;
    const hasta = desde + p.elementos.length - 1;
    return `${desde}–${hasta} de ${p.totalElementos}`;
  });
}
