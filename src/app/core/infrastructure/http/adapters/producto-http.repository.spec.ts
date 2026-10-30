import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BASE_URL } from '../api-config';
import { ProductoHttpRepository } from './producto-http.repository';
import { Producto } from '../../../domain/models/producto.model';

describe('ProductoHttpRepository', () => {
  let repo: ProductoHttpRepository;
  let http: HttpTestingController;
  const dto = {
    id: 5,
    nombre: 'Leche 1 L',
    descripcion: null,
    precioUnitario: 27,
    existencia: 120,
    activo: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductoHttpRepository,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    repo = TestBed.inject(ProductoHttpRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('GET /api/productos paginado', () => {
    let total = 0;
    repo.listar({ pagina: 0, tamano: 10 }).subscribe((p) => (total = p.totalElementos));
    http
      .expectOne((r) => r.url === '/api/productos' && r.params.get('tamano') === '10')
      .flush({ content: [dto], page: { size: 10, number: 0, totalElements: 1, totalPages: 1 } });
    expect(total).toBe(1);
  });

  it('GET /api/productos/activos', () => {
    let lista: Producto[] = [];
    repo.listarActivos().subscribe((l) => (lista = l));
    http.expectOne('/api/productos/activos').flush([dto]);
    expect(lista[0].nombre).toBe('Leche 1 L');
  });

  it('GET /api/productos/{id}', () => {
    repo.obtenerPorId(5).subscribe();
    expect(http.expectOne('/api/productos/5').request.method).toBe('GET');
  });

  it('POST y PUT envían ProductoRequest', () => {
    const datos = { nombre: 'Leche 1 L', descripcion: null, precioUnitario: 27, existencia: 120 };
    repo.registrar(datos).subscribe();
    const post = http.expectOne('/api/productos');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual(datos);
    post.flush(dto);

    repo.actualizar(5, datos).subscribe();
    const put = http.expectOne('/api/productos/5');
    expect(put.request.method).toBe('PUT');
    put.flush(dto);
  });

  it('PATCH activar y desactivar (204 sin cuerpo)', () => {
    repo.desactivar(5).subscribe();
    const d = http.expectOne('/api/productos/5/desactivar');
    expect(d.request.method).toBe('PATCH');
    d.flush(null, { status: 204, statusText: 'No Content' });

    repo.activar(5).subscribe();
    const a = http.expectOne('/api/productos/5/activar');
    expect(a.request.method).toBe('PATCH');
    a.flush(null, { status: 204, statusText: 'No Content' });
  });
});
