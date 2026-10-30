import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PedidoRepository } from '../../../domain/ports/pedido.repository';
import { AppError } from '../../../domain/errors/app-error';
import { unPedido } from '../../../../../testing/datos-prueba';
import { ActualizarPedidoUseCase } from './actualizar-pedido.use-case';

describe('ActualizarPedidoUseCase (CU-10)', () => {
  let repo: jasmine.SpyObj<PedidoRepository>;
  let useCase: ActualizarPedidoUseCase;

  beforeEach(() => {
    repo = jasmine.createSpyObj<PedidoRepository>('PedidoRepository', ['actualizar']);
    repo.actualizar.and.returnValue(of(unPedido()));
    TestBed.configureTestingModule({ providers: [{ provide: PedidoRepository, useValue: repo }] });
    useCase = TestBed.inject(ActualizarPedidoUseCase);
  });

  it('envía las partidas de un BORRADOR', () => {
    useCase.execute(unPedido(), [{ idProducto: 5, cantidad: 3 }]).subscribe();
    expect(repo.actualizar).toHaveBeenCalledWith(1, [{ idProducto: 5, cantidad: 3 }]);
  });

  for (const estado of ['CONFIRMADO', 'COMPLETADO', 'CANCELADO'] as const) {
    it(`no edita un pedido ${estado}: 409 local sin llamar a la API`, () => {
      let error: AppError | undefined;
      useCase
        .execute(unPedido({ estado }), [{ idProducto: 5, cantidad: 3 }])
        .subscribe({ error: (e) => (error = e) });
      expect(repo.actualizar).not.toHaveBeenCalled();
      expect(error?.tipo).toBe('CONFLICTO');
    });
  }

  it('no deja un pedido sin partidas', () => {
    let error: AppError | undefined;
    useCase.execute(unPedido(), []).subscribe({ error: (e) => (error = e) });
    expect(repo.actualizar).not.toHaveBeenCalled();
    expect(error?.tipo).toBe('VALIDACION');
  });
});
