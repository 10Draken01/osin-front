import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PedidoRepository } from '@core/domain/ports/pedido.repository';
import { ProductoRepository } from '@core/domain/ports/producto.repository';
import { AppError } from '@core/domain/errors/app-error';
import { unPedido, unProducto } from '../../../../testing/datos-prueba';
import { PedidoFormularioStore } from './pedido-formulario.store';

describe('PedidoFormularioStore', () => {
  let pedidos: jasmine.SpyObj<PedidoRepository>;
  let productos: jasmine.SpyObj<ProductoRepository>;
  let store: PedidoFormularioStore;

  // Leche subió de 27 a 30 después de crear el pedido
  const leche = unProducto({ precioUnitario: 30 });
  const borrador = unPedido({
    id: 4,
    folio: 'PED-000004',
    partidas: [
      { idProducto: 5, nombre: 'Leche 1 L', cantidad: 2, precioUnitario: 27, subtotal: 54 },
      { idProducto: 8, nombre: 'Galletas', cantidad: 1, precioUnitario: 19.9, subtotal: 19.9 },
    ],
  });

  beforeEach(() => {
    pedidos = jasmine.createSpyObj<PedidoRepository>('PedidoRepository', [
      'obtenerPorId',
      'registrar',
      'actualizar',
    ]);
    productos = jasmine.createSpyObj<ProductoRepository>('ProductoRepository', ['listarActivos']);
    // Galletas (id 8) ya no está activo
    productos.listarActivos.and.returnValue(of([leche]));
    pedidos.obtenerPorId.and.returnValue(of(borrador));
    TestBed.configureTestingModule({
      providers: [
        PedidoFormularioStore,
        { provide: PedidoRepository, useValue: pedidos },
        { provide: ProductoRepository, useValue: productos },
      ],
    });
    store = TestBed.inject(PedidoFormularioStore);
  });

  it('sin id es captura nueva y no consulta pedidos', () => {
    store.cargar();
    expect(store.esEdicion()).toBeFalse();
    expect(pedidos.obtenerPorId).not.toHaveBeenCalled();
  });

  it('al editar arma el carrito con el precio vigente y avisa de los productos inactivos', () => {
    store.cargar(4);

    expect(store.esEdicion()).toBeTrue();
    expect(store.carrito().length).toBe(1);
    expect(store.carrito()[0].producto.precioUnitario).toBe(30);
    expect(store.carrito()[0].cantidad).toBe(2);
    expect(store.partidasRetiradas()).toEqual(['Galletas']);
  });

  it('guardar en edición usa PUT con las partidas del carrito', () => {
    pedidos.actualizar.and.returnValue(of(borrador));
    store.cargar(4);
    store.cambiarCantidad(5, 3);

    store.guardar().subscribe();

    expect(pedidos.actualizar).toHaveBeenCalledWith(4, [{ idProducto: 5, cantidad: 3 }]);
    expect(pedidos.registrar).not.toHaveBeenCalled();
  });

  it('marca como no editable un pedido que ya no está en borrador', () => {
    pedidos.obtenerPorId.and.returnValue(of(unPedido({ estado: 'CONFIRMADO' })));
    store.cargar(1);
    expect(store.noEditable()).toBeTrue();
  });

  it('si el servidor responde 409 al guardar recarga el pedido y conserva el error', () => {
    pedidos.actualizar.and.returnValue(
      throwError(() => new AppError('CONFLICTO', 'El pedido no se puede modificar', 409)),
    );
    store.cargar(4);
    pedidos.obtenerPorId.and.returnValue(of(unPedido({ id: 4, estado: 'CONFIRMADO' })));

    store.guardar().subscribe({ error: () => undefined });

    expect(store.errorGuardado()?.tipo).toBe('CONFLICTO');
    expect(store.noEditable()).toBeTrue();
  });
});
