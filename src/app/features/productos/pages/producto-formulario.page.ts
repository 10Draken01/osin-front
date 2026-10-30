import { ChangeDetectionStrategy, Component, computed, effect, inject, input, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatosProducto } from '@core/domain/models/producto.model';
import { AppError } from '@core/domain/errors/app-error';
import { BotonComponent, SpinnerComponent } from '@shared/ui/atoms';
import { AlertaComponent, EncabezadoPaginaComponent, EstadoVacioComponent } from '@shared/ui/molecules';
import { NotificacionService } from '@shared/ui/services';
import { FormularioProductoComponent } from '../ui/organisms/formulario-producto.component';
import { ProductoFormularioStore } from '../state/producto-formulario.store';

/**
 * Página: alta (/productos/nuevo) y edición (/productos/:id/editar) con el mismo formulario.
 * Cubre POST /api/productos, GET /api/productos/{id} y PUT /api/productos/{id}.
 */
@Component({
  selector: 'app-producto-formulario-page',
  imports: [
    RouterLink,
    BotonComponent,
    SpinnerComponent,
    AlertaComponent,
    EncabezadoPaginaComponent,
    EstadoVacioComponent,
    FormularioProductoComponent,
  ],
  providers: [ProductoFormularioStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex max-w-3xl flex-col gap-6' },
  template: `
    <ui-encabezado-pagina
      [titulo]="esEdicion() ? 'Editar producto' : 'Nuevo producto'"
      [descripcion]="
        esEdicion()
          ? 'Los cambios de precio aplican a los pedidos que se creen a partir de ahora.'
          : 'El producto queda activo y disponible para pedidos en cuanto lo registres.'
      "
      regresarA="/productos"
      textoRegreso="Productos"
    />

    @if (store.errorCarga(); as error) {
      @if (error.tipo === 'NO_ENCONTRADO') {
        <ui-estado-vacio titulo="Este producto no existe" [descripcion]="error.message">
          <a uiBoton routerLink="/productos">Ir al catálogo</a>
        </ui-estado-vacio>
      } @else {
        <ui-alerta tono="error" titulo="No se pudo cargar el producto">{{ error.message }}</ui-alerta>
      }
    } @else if (esEdicion() && store.cargando()) {
      <div class="flex items-center gap-2 py-10 text-tinta-suave"><ui-spinner /> Cargando</div>
    } @else {
      @if (errorGeneral(); as error) {
        <ui-alerta tono="error" titulo="No se guardó el producto" [detalles]="detallesSinCampo()">
          {{ error.message }}
        </ui-alerta>
      }
      <app-formulario-producto
        [producto]="store.producto()"
        [guardando]="store.guardando()"
        [erroresServidor]="store.errorGuardado()?.detalles ?? []"
        (guardar)="guardar($event)"
        (cancelar)="volver()"
      />
    }
  `,
})
export class ProductoFormularioPage {
  protected readonly store = inject(ProductoFormularioStore);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);

  /** Parámetro de ruta :id (solo en edición). */
  readonly id = input<string>();
  protected readonly esEdicion = computed(() => !!this.id());

  protected readonly errorGeneral = computed(() => this.store.errorGuardado());
  /** Los errores con prefijo de campo se muestran en el campo; el resto, aquí. */
  protected readonly detallesSinCampo = computed(() =>
    (this.store.errorGuardado()?.detalles ?? []).filter(
      (d) => !/^(nombre|descripcion|precioUnitario|existencia):/.test(d),
    ),
  );

  constructor() {
    effect(() => {
      const valor = this.id();
      if (valor === undefined) return; // alta
      const id = Number(valor);
      untracked(() =>
        Number.isInteger(id) && id > 0
          ? this.store.cargar(id)
          : this.store.errorCarga.set(
              new AppError('NO_ENCONTRADO', `No hay un producto con el identificador "${valor}".`, 404),
            ),
      );
    });
  }

  protected guardar(datos: DatosProducto): void {
    this.store.guardar(datos).subscribe({
      next: (p) => {
        this.notificaciones.exito(
          this.esEdicion() ? `Cambios guardados en ${p.nombre}.` : `${p.nombre} registrado.`,
        );
        void this.router.navigate(['/productos']);
      },
      error: () => {
        /* El store ya guardó el error para mostrarlo en la página */
      },
    });
  }

  protected volver(): void {
    void this.router.navigate(['/productos']);
  }
}
