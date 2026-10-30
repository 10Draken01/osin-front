import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatosProducto, LIMITES_PRODUCTO, Producto } from '@core/domain/models/producto.model';
import { BotonComponent, CampoDirective } from '@shared/ui/atoms';
import { CampoFormularioComponent } from '@shared/ui/molecules';

type CampoProducto = 'nombre' | 'descripcion' | 'precioUnitario' | 'existencia';

const PATRON_PRECIO = /^\d{1,10}(\.\d{1,2})?$/;

/**
 * Organismo: formulario de alta/edición. Valida en el cliente con las mismas reglas que
 * ProductoRequest y además muestra junto a cada campo los errores que devuelva el servidor.
 */
@Component({
  selector: 'app-formulario-producto',
  imports: [ReactiveFormsModule, BotonComponent, CampoDirective, CampoFormularioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="enviar()"
      novalidate
      class="space-y-5 rounded-lg border border-linea bg-superficie p-5 sm:p-6"
    >
      <ui-campo-formulario
        etiqueta="Nombre"
        paraId="nombre"
        [error]="error('nombre')"
        [ayuda]="'Debe ser único en el catálogo. Máximo ' + limites.nombreMax + ' caracteres.'"
      >
        <input
          uiCampo
          id="nombre"
          formControlName="nombre"
          autocomplete="off"
          [maxlength]="limites.nombreMax"
          [invalido]="!!error('nombre')"
        />
      </ui-campo-formulario>

      <ui-campo-formulario
        etiqueta="Descripción"
        paraId="descripcion"
        [opcional]="true"
        [error]="error('descripcion')"
        [ayuda]="largoDescripcion() + ' / ' + limites.descripcionMax"
      >
        <textarea
          uiCampo
          id="descripcion"
          rows="3"
          formControlName="descripcion"
          [maxlength]="limites.descripcionMax"
          [invalido]="!!error('descripcion')"
        ></textarea>
      </ui-campo-formulario>

      <div class="grid gap-5 sm:grid-cols-2">
        <ui-campo-formulario
          etiqueta="Precio unitario (MXN)"
          paraId="precioUnitario"
          [error]="error('precioUnitario')"
          ayuda="Mayor a 0, hasta 2 decimales. Los pedidos ya creados conservan su precio."
        >
          <input
            uiCampo
            id="precioUnitario"
            type="number"
            inputmode="decimal"
            min="0.01"
            step="0.01"
            class="cifra"
            formControlName="precioUnitario"
            [invalido]="!!error('precioUnitario')"
          />
        </ui-campo-formulario>

        <ui-campo-formulario
          etiqueta="Existencia (piezas)"
          paraId="existencia"
          [error]="error('existencia')"
          ayuda="Piezas disponibles hoy. Confirmar pedidos la descuenta automáticamente."
        >
          <input
            uiCampo
            id="existencia"
            type="number"
            inputmode="numeric"
            min="0"
            step="1"
            class="cifra"
            formControlName="existencia"
            [invalido]="!!error('existencia')"
          />
        </ui-campo-formulario>
      </div>

      <div class="flex flex-wrap justify-end gap-2 border-t border-linea pt-5">
        <button uiBoton type="button" (click)="cancelar.emit()">Cancelar</button>
        <button uiBoton type="submit" variante="primario" [cargando]="guardando()">
          {{ producto() ? 'Guardar cambios' : 'Registrar producto' }}
        </button>
      </div>
    </form>
  `,
})
export class FormularioProductoComponent {
  readonly producto = input<Producto | null>(null);
  readonly guardando = input(false);
  /** Errores "campo: mensaje" del ProblemDetail; se reparten por campo. */
  readonly erroresServidor = input<readonly string[]>([]);
  readonly guardar = output<DatosProducto>();
  readonly cancelar = output<void>();

  protected readonly limites = LIMITES_PRODUCTO;
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(LIMITES_PRODUCTO.nombreMax)]],
    descripcion: ['', [Validators.maxLength(LIMITES_PRODUCTO.descripcionMax)]],
    precioUnitario: [
      null as number | null,
      [Validators.required, Validators.min(0.01), Validators.pattern(PATRON_PRECIO)],
    ],
    existencia: [
      0 as number | null,
      [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)],
    ],
  });

  private readonly estadoForm = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  private readonly valorDescripcion = toSignal(this.form.controls.descripcion.valueChanges, {
    initialValue: '',
  });
  protected readonly largoDescripcion = computed(() => this.valorDescripcion().length);

  private readonly erroresPorCampo = computed(() => {
    const mapa = new Map<string, string>();
    for (const linea of this.erroresServidor()) {
      const [campo, ...resto] = linea.split(':');
      if (resto.length > 0) mapa.set(campo.trim(), resto.join(':').trim());
    }
    return mapa;
  });

  constructor() {
    // Precarga en modo edición
    effect(() => {
      const p = this.producto();
      if (p) {
        this.form.reset({
          nombre: p.nombre,
          descripcion: p.descripcion ?? '',
          precioUnitario: p.precioUnitario,
          existencia: p.existencia,
        });
      }
    });
  }

  protected error(campo: CampoProducto): string | null {
    this.estadoForm(); // re-evaluar cuando cambia la validez
    const control = this.form.controls[campo];
    if (control.invalid && (control.touched || control.dirty)) {
      return mensajeLocal(campo, control.errors ?? {});
    }
    return this.erroresPorCampo().get(campo) ?? null;
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardar.emit({
      nombre: v.nombre,
      descripcion: v.descripcion,
      precioUnitario: Number(v.precioUnitario),
      existencia: Number(v.existencia),
    });
  }
}

function mensajeLocal(campo: CampoProducto, errores: Record<string, unknown>): string {
  if (errores['required']) {
    return campo === 'nombre' ? 'Escribe el nombre del producto.' : 'Este dato es obligatorio.';
  }
  switch (campo) {
    case 'nombre':
      return `Máximo ${LIMITES_PRODUCTO.nombreMax} caracteres.`;
    case 'descripcion':
      return `Máximo ${LIMITES_PRODUCTO.descripcionMax} caracteres.`;
    case 'precioUnitario':
      return errores['min']
        ? 'El precio debe ser mayor a 0.'
        : 'Usa hasta 10 enteros y 2 decimales, p. ej. 24.50.';
    case 'existencia':
      return 'Usa un número entero de 0 en adelante.';
  }
}
