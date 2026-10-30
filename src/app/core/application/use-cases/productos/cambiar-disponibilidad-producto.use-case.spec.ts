import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductoRepository } from '../../../domain/ports/producto.repository';
import { unProducto } from '../../../../../testing/datos-prueba';
import { CambiarDisponibilidadProductoUseCase } from './cambiar-disponibilidad-producto.use-case';

describe('CambiarDisponibilidadProductoUseCase', () => {
  let repo: jasmine.SpyObj<ProductoRepository>;
  let useCase: CambiarDisponibilidadProductoUseCase;

  beforeEach(() => {
    repo = jasmine.createSpyObj<ProductoRepository>('ProductoRepository', ['activar', 'desactivar']);
    repo.activar.and.returnValue(of(undefined));
    repo.desactivar.and.returnValue(of(undefined));
    TestBed.configureTestingModule({ providers: [{ provide: ProductoRepository, useValue: repo }] });
    useCase = TestBed.inject(CambiarDisponibilidadProductoUseCase);
  });

  it('desactiva un producto activo', () => {
    useCase.execute(unProducto({ activo: true })).subscribe();
    expect(repo.desactivar).toHaveBeenCalledWith(5);
  });

  it('activa un producto inactivo', () => {
    useCase.execute(unProducto({ activo: false })).subscribe();
    expect(repo.activar).toHaveBeenCalledWith(5);
  });
});
