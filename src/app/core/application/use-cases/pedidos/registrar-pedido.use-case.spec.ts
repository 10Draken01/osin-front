import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PedidoRepository } from '../../../domain/ports/pedido.repository';
import { AppError } from '../../../domain/errors/app-error';
import { unPedido } from '../../../../../testing/datos-prueba';
import { RegistrarPedidoUseCase, validarPartidas } from './registrar-pedido.use-case';

describe('RegistrarPedidoUseCase', () => {
  let repo: jasmine.SpyObj<PedidoRepository>;
  let useCase: RegistrarPedidoUseCase;

  beforeEach(() => {
    repo = jasmine.createSpyObj<PedidoRepository>('PedidoRepository', ['registrar']);
    repo.registrar.and.returnValue(of(unPedido()));
    TestBed.configureTestingModule({ providers: [{ provide: PedidoRepository, useValue: repo }] });
    useCase = TestBed.inject(RegistrarPedidoUseCase);
  });

  it('envía solo producto y cantidad', () => {
    useCase.execute([{ idProducto: 5, cantidad: 2 }]).subscribe();
    expect(repo.registrar).toHaveBeenCalledWith([{ idProducto: 5, cantidad: 2 }]);
  });

  it('rechaza un pedido vacío sin llamar a la API', () => {
    let error: AppError | undefined;
    useCase.execute([]).subscribe({ error: (e) => (error = e) });
    expect(repo.registrar).not.toHaveBeenCalled();
    expect(error?.tipo).toBe('VALIDACION');
  });

  it('rechaza productos repetidos y cantidades no válidas', () => {
    expect(
      validarPartidas([
        { idProducto: 5, cantidad: 1 },
        { idProducto: 5, cantidad: 1 },
      ]),
    ).toEqual(['El producto con id 5 esta repetido en el pedido']);
    expect(validarPartidas([{ idProducto: 5, cantidad: 0 }])).toEqual([
      'productos[0].cantidad: La cantidad debe ser mayor a 0',
    ]);
  });
});
