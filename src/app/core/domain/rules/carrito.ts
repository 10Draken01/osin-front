import { NuevaPartida } from '../models/pedido.model';
import { Producto } from '../models/producto.model';

/**
 * Pedido en captura (antes de enviarlo). Funciones puras e inmutables:
 * cada operación devuelve un carrito nuevo, lo que facilita usarlas con signals y probarlas.
 */
export interface LineaCarrito {
  readonly producto: Producto;
  readonly cantidad: number;
}

export type Carrito = readonly LineaCarrito[];

export const CARRITO_VACIO: Carrito = [];

/** Agrega un producto. Si ya está, suma la cantidad (el backend no acepta productos repetidos). */
export function agregarAlCarrito(carrito: Carrito, producto: Producto, cantidad = 1): Carrito {
  const existente = carrito.find((l) => l.producto.id === producto.id);
  if (existente) {
    return cambiarCantidad(carrito, producto.id, existente.cantidad + cantidad);
  }
  return [...carrito, { producto, cantidad: normalizarCantidad(cantidad) }];
}

export function cambiarCantidad(carrito: Carrito, idProducto: number, cantidad: number): Carrito {
  return carrito.map((l) =>
    l.producto.id === idProducto ? { ...l, cantidad: normalizarCantidad(cantidad) } : l,
  );
}

export function quitarDelCarrito(carrito: Carrito, idProducto: number): Carrito {
  return carrito.filter((l) => l.producto.id !== idProducto);
}

/** Total estimado con el precio actual del catálogo. El total real lo calcula el servidor. */
export function totalEstimado(carrito: Carrito): number {
  const centavos = carrito.reduce(
    (acc, l) => acc + Math.round(l.producto.precioUnitario * 100) * l.cantidad,
    0,
  );
  return centavos / 100;
}

export function subtotalEstimado(linea: LineaCarrito): number {
  return (Math.round(linea.producto.precioUnitario * 100) * linea.cantidad) / 100;
}

/** Líneas cuya cantidad supera la existencia actual: se pueden guardar, pero no confirmar. */
export function lineasSinExistencia(carrito: Carrito): readonly LineaCarrito[] {
  return carrito.filter((l) => l.cantidad > l.producto.existencia);
}

export function totalPiezas(carrito: Carrito): number {
  return carrito.reduce((acc, l) => acc + l.cantidad, 0);
}

export function aPartidas(carrito: Carrito): NuevaPartida[] {
  return carrito.map((l) => ({ idProducto: l.producto.id, cantidad: l.cantidad }));
}

/** Cantidades enteras y mayores a 0 (supuesto S-03 del backend: se vende por pieza). */
function normalizarCantidad(cantidad: number): number {
  if (!Number.isFinite(cantidad)) return 1;
  return Math.max(1, Math.trunc(cantidad));
}
