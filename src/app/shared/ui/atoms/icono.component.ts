import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Conjunto cerrado de íconos (trazos SVG 24x24). Evita depender de una fuente de íconos externa. */
const TRAZOS = {
  mas: 'M12 5v14M5 12h14',
  menos: 'M5 12h14',
  cerrar: 'M6 6l12 12M18 6L6 18',
  buscar: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-4-4',
  izquierda: 'M15 6l-6 6 6 6',
  derecha: 'M9 6l6 6-6 6',
  regresar: 'M19 12H5M11 6l-6 6 6 6',
  caja: 'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10',
  pedido: 'M7 3h10l2 3v15H5V6l2-3zM5 6h14M9 11h6M9 15h4',
  carrito: 'M3 4h2l2.4 11h10.2L20 8H7M10 20h.01M17 20h.01',
  check: 'M5 12l5 5 9-10',
  alerta: 'M12 4l9 16H3l9-16zM12 10v4M12 17h.01',
  info: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 11v5M12 8h.01',
  editar: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
  encender: 'M12 3v8M6.3 7.3a8 8 0 1 0 11.4 0',
  ojo: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
} as const;

export type NombreIcono = keyof typeof TRAZOS;

@Component({
  selector: 'ui-icono',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg
      [attr.width]="tamano()"
      [attr.height]="tamano()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path [attr.d]="trazo()" />
    </svg>
  `,
})
export class IconoComponent {
  readonly nombre = input.required<NombreIcono>();
  readonly tamano = input(18);
  protected readonly trazo = computed(() => TRAZOS[this.nombre()]);
}
