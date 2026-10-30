import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ProductoRepository } from '../../../domain/ports/producto.repository';
import { AppError } from '../../../domain/errors/app-error';
import { DatosProducto } from '../../../domain/models/producto.model';
import { unProducto } from '../../../../../testing/datos-prueba';
import { GuardarProductoUseCase, validarDatosProducto } from './guardar-producto.use-case';

describe('GuardarProductoUseCase', () => {
  let repo: jasmine.SpyObj<ProductoRepository>;
  let useCase: GuardarProductoUseCase;
  const validos: DatosProducto = {
    nombre: '  Leche 1 L ',
    descripcion: '   ',
    precioUnitario: 27,
    existencia: 120,
  };

  beforeEach(() => {
    repo = jasmine.createSpyObj<ProductoRepository>('ProductoRepository', ['registrar', 'actualizar']);
    repo.registrar.and.returnValue(of(unProducto()));
    repo.actualizar.and.returnValue(of(unProducto()));
    TestBed.configureTestingModule({ providers: [{ provide: ProductoRepository, useValue: repo }] });
    useCase = TestBed.inject(GuardarProductoUseCase);
  });

  it('sin id registra; recorta el nombre y manda descripción vacía como null', () => {
    useCase.execute(validos).subscribe();
    expect(repo.registrar).toHaveBeenCalledWith({
      nombre: 'Leche 1 L',
      descripcion: null,
      precioUnitario: 27,
      existencia: 120,
    });
    expect(repo.actualizar).not.toHaveBeenCalled();
  });

  it('con id actualiza', () => {
    useCase.execute(validos, 5).subscribe();
    expect(repo.actualizar).toHaveBeenCalledWith(5, jasmine.objectContaining({ nombre: 'Leche 1 L' }));
  });

  it('no llama a la API si los datos son inválidos y devuelve error de validación', () => {
    let error: AppError | undefined;
    useCase.execute({ ...validos, precioUnitario: 0 }).subscribe({ error: (e) => (error = e) });
    expect(repo.registrar).not.toHaveBeenCalled();
    expect(error?.tipo).toBe('VALIDACION');
    expect(error?.detalles[0]).toMatch(/^precioUnitario:/);
  });

  it('aplica las mismas reglas que ProductoRequest', () => {
    expect(validarDatosProducto({ ...validos, nombre: '' })).toContain(
      'nombre: El nombre del producto es requerido',
    );
    expect(validarDatosProducto({ ...validos, nombre: 'x'.repeat(121) }).length).toBe(1);
    expect(validarDatosProducto({ ...validos, precioUnitario: 1.234 }).length).toBe(1);
    expect(validarDatosProducto({ ...validos, existencia: -1 }).length).toBe(1);
    expect(validarDatosProducto({ ...validos, existencia: 1.5 }).length).toBe(1);
    expect(validarDatosProducto({ ...validos, nombre: 'Leche' })).toEqual([]);
  });
});
