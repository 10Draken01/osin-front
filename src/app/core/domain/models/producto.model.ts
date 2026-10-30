/**
 * Producto del catálogo tal como lo usa la aplicación.
 * Es independiente del JSON de la API: el mapper de infraestructura traduce un formato al otro.
 */
export interface Producto {
  readonly id: number;
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly precioUnitario: number;
  readonly existencia: number;
  readonly activo: boolean;
}

/** Datos que el operador captura para registrar o actualizar un producto. */
export interface DatosProducto {
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly precioUnitario: number;
  readonly existencia: number;
}

/** Límites de validación. Son los mismos que aplica el backend en ProductoRequest. */
export const LIMITES_PRODUCTO = {
  nombreMax: 120,
  descripcionMax: 500,
  precioEnterosMax: 10,
  precioDecimalesMax: 2,
} as const;
