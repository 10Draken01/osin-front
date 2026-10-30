import { Observable } from 'rxjs';
import { DatosProducto, Producto } from '../models/producto.model';
import { Pagina, SolicitudPagina } from '../models/pagina.model';

/**
 * Puerto (interfaz) del repositorio de productos.
 * Es una clase abstracta para poder usarla como token de inyección en Angular;
 * la implementación HTTP vive en infraestructura y se enlaza en core/providers.ts.
 */
export abstract class ProductoRepository {
  /** GET /api/productos?pagina=&tamano= */
  abstract listar(solicitud: SolicitudPagina): Observable<Pagina<Producto>>;
  /** GET /api/productos/activos */
  abstract listarActivos(): Observable<Producto[]>;
  /** GET /api/productos/{id} */
  abstract obtenerPorId(id: number): Observable<Producto>;
  /** POST /api/productos */
  abstract registrar(datos: DatosProducto): Observable<Producto>;
  /** PUT /api/productos/{id} */
  abstract actualizar(id: number, datos: DatosProducto): Observable<Producto>;
  /** PATCH /api/productos/{id}/activar */
  abstract activar(id: number): Observable<void>;
  /** PATCH /api/productos/{id}/desactivar */
  abstract desactivar(id: number): Observable<void>;
}
