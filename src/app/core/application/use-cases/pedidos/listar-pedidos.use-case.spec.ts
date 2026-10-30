import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PedidoRepository } from '../../../domain/ports/pedido.repository';
import { ListarPedidosUseCase } from './listar-pedidos.use-case';

describe('ListarPedidosUseCase', () => {
  let repo: jasmine.SpyObj<PedidoRepository>;
  let useCase: ListarPedidosUseCase;

  beforeEach(() => {
    repo = jasmine.createSpyObj<PedidoRepository>('PedidoRepository', ['listar']);
    repo.listar.and.returnValue(
      of({ elementos: [], numero: 0, tamano: 10, totalElementos: 0, totalPaginas: 0 }),
    );
    TestBed.configureTestingModule({ providers: [{ provide: PedidoRepository, useValue: repo }] });
    useCase = TestBed.inject(ListarPedidosUseCase);
  });

  it('normaliza el folio (espacios y mayúsculas) y omite el vacío', () => {
    useCase.execute({ estado: 'BORRADOR', folio: ' ped-0001 ' }, { pagina: 0, tamano: 10 }).subscribe();
    expect(repo.listar).toHaveBeenCalledWith(
      { estado: 'BORRADOR', folio: 'PED-0001' },
      { pagina: 0, tamano: 10 },
    );

    useCase.execute({ estado: null, folio: '   ' }, { pagina: 0, tamano: 10 }).subscribe();
    expect(repo.listar.calls.mostRecent().args[0]).toEqual({ estado: null, folio: null });
  });

  it('no manda paginación que la API rechazaría con 400', () => {
    useCase.execute({ estado: null, folio: null }, { pagina: -3, tamano: 500 }).subscribe();
    expect(repo.listar.calls.mostRecent().args[1]).toEqual({ pagina: 0, tamano: 100 });
  });
});
