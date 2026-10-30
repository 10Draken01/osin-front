import { unProducto } from '../../../../testing/datos-prueba';
import {
  CARRITO_VACIO,
  aPartidas,
  agregarAlCarrito,
  cambiarCantidad,
  lineasSinExistencia,
  quitarDelCarrito,
  totalEstimado,
} from './carrito';

describe('Carrito (pedido en captura)', () => {
  const leche = unProducto();
  const aceite = unProducto({ id: 3, nombre: 'Aceite 1 L', precioUnitario: 45, existencia: 60 });

  it('agregar el mismo producto suma la cantidad en lugar de repetir la partida', () => {
    const c = agregarAlCarrito(agregarAlCarrito(CARRITO_VACIO, leche), leche);
    expect(c.length).toBe(1);
    expect(c[0].cantidad).toBe(2);
  });

  it('no modifica el carrito original (inmutable)', () => {
    const original = agregarAlCarrito(CARRITO_VACIO, leche);
    cambiarCantidad(original, leche.id, 5);
    expect(original[0].cantidad).toBe(1);
  });

  it('la cantidad siempre es un entero mayor o igual a 1', () => {
    const c = agregarAlCarrito(CARRITO_VACIO, leche);
    expect(cambiarCantidad(c, leche.id, 0)[0].cantidad).toBe(1);
    expect(cambiarCantidad(c, leche.id, 2.7)[0].cantidad).toBe(2);
  });

  it('escenario A: Leche x2 + Aceite x1 = 99.00', () => {
    let c = agregarAlCarrito(CARRITO_VACIO, leche, 2);
    c = agregarAlCarrito(c, aceite);
    expect(totalEstimado(c)).toBe(99);
  });

  it('suma en centavos para evitar errores de punto flotante', () => {
    const c = agregarAlCarrito(CARRITO_VACIO, unProducto({ precioUnitario: 19.9 }), 3);
    expect(totalEstimado(c)).toBe(59.7);
  });

  it('detecta partidas que superan la existencia (escenario B)', () => {
    const cafe = unProducto({ id: 6, nombre: 'Cafe 250 g', existencia: 40 });
    const c = agregarAlCarrito(CARRITO_VACIO, cafe, 41);
    expect(lineasSinExistencia(c).map((l) => l.producto.id)).toEqual([6]);
  });

  it('quita partidas y convierte a NuevaPartida', () => {
    let c = agregarAlCarrito(agregarAlCarrito(CARRITO_VACIO, leche, 2), aceite);
    c = quitarDelCarrito(c, aceite.id);
    expect(aPartidas(c)).toEqual([{ idProducto: 5, cantidad: 2 }]);
  });
});
