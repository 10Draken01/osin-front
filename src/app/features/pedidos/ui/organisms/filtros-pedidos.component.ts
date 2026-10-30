import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ESTADOS_PEDIDO, EstadoPedido, FiltroPedidos } from '@core/domain/models/pedido.model';
import { ETIQUETA_ESTADO } from '@core/domain/rules/estado-pedido.rules';
import { BotonComponent, CampoDirective, EtiquetaDirective, IconoComponent } from '@shared/ui/atoms';

/**
 * Organismo: filtros del listado (estado y folio, los dos que acepta GET /api/pedidos).
 * El estado filtra al elegirlo; el folio al presionar Buscar o Enter, para no
 * disparar una petición por cada tecla.
 */
@Component({
  selector: 'app-filtros-pedidos',
  imports: [ReactiveFormsModule, BotonComponent, CampoDirective, EtiquetaDirective, IconoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="aplicar()"
      role="search"
      class="flex flex-wrap items-end gap-3"
    >
      <div class="w-full space-y-1.5 sm:w-48">
        <label uiEtiqueta for="filtro-estado">Estado</label>
        <select uiCampo id="filtro-estado" formControlName="estado" (change)="aplicar()">
          <option value="">Todos</option>
          @for (e of estados; track e) {
            <option [value]="e">{{ etiquetas[e] }}</option>
          }
        </select>
      </div>
      <div class="min-w-0 flex-1 space-y-1.5 sm:max-w-xs">
        <label uiEtiqueta for="filtro-folio">Folio</label>
        <input
          uiCampo
          id="filtro-folio"
          formControlName="folio"
          placeholder="PED-000001 o parte del folio"
          autocomplete="off"
          class="uppercase placeholder:normal-case"
        />
      </div>
      <div class="flex gap-2">
        <button uiBoton type="submit" variante="primario">
          <ui-icono nombre="buscar" [tamano]="16" />
          Buscar
        </button>
        @if (hayFiltros()) {
          <button uiBoton type="button" variante="fantasma" (click)="limpiar()">Quitar filtros</button>
        }
      </div>
    </form>
  `,
})
export class FiltrosPedidosComponent {
  readonly filtro = input.required<FiltroPedidos>();
  readonly filtrar = output<FiltroPedidos>();

  protected readonly estados = ESTADOS_PEDIDO;
  protected readonly etiquetas = ETIQUETA_ESTADO;
  protected readonly form = inject(NonNullableFormBuilder).group({
    estado: '' as EstadoPedido | '',
    folio: '',
  });

  constructor() {
    // Sincroniza con la URL (p. ej. al usar atrás/adelante del navegador)
    effect(() => {
      const f = this.filtro();
      this.form.setValue({ estado: f.estado ?? '', folio: f.folio ?? '' }, { emitEvent: false });
    });
  }

  protected hayFiltros(): boolean {
    const f = this.filtro();
    return !!f.estado || !!f.folio;
  }

  protected aplicar(): void {
    const { estado, folio } = this.form.getRawValue();
    this.filtrar.emit({ estado: estado || null, folio: folio.trim() || null });
  }

  protected limpiar(): void {
    this.form.setValue({ estado: '', folio: '' });
    this.aplicar();
  }
}
