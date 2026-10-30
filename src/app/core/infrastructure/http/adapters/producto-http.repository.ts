import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProductoRepository } from '../../../domain/ports/producto.repository';
import { DatosProducto, Producto } from '../../../domain/models/producto.model';
import { Pagina, SolicitudPagina } from '../../../domain/models/pagina.model';
import { API_BASE_URL } from '../api-config';
import { ProductoResponseDto } from '../dto/producto.dto';
import { PaginaDto } from '../dto/pagina.dto';
import { ProductoMapper } from '../mappers/producto.mapper';
import { aPagina } from '../mappers/pagina.mapper';

/** Adaptador HTTP de ProductoRepository para /api/productos. */
@Injectable()
export class ProductoHttpRepository extends ProductoRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/productos`;

  listar(s: SolicitudPagina): Observable<Pagina<Producto>> {
    const params = new HttpParams().set('pagina', s.pagina).set('tamano', s.tamano);
    return this.http
      .get<PaginaDto<ProductoResponseDto>>(this.url, { params })
      .pipe(map((dto) => aPagina(dto, ProductoMapper.aDominio)));
  }

  listarActivos(): Observable<Producto[]> {
    return this.http
      .get<ProductoResponseDto[]>(`${this.url}/activos`)
      .pipe(map((lista) => lista.map(ProductoMapper.aDominio)));
  }

  obtenerPorId(id: number): Observable<Producto> {
    return this.http
      .get<ProductoResponseDto>(`${this.url}/${id}`)
      .pipe(map(ProductoMapper.aDominio));
  }

  registrar(datos: DatosProducto): Observable<Producto> {
    return this.http
      .post<ProductoResponseDto>(this.url, ProductoMapper.aRequest(datos))
      .pipe(map(ProductoMapper.aDominio));
  }

  actualizar(id: number, datos: DatosProducto): Observable<Producto> {
    return this.http
      .put<ProductoResponseDto>(`${this.url}/${id}`, ProductoMapper.aRequest(datos))
      .pipe(map(ProductoMapper.aDominio));
  }

  activar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/activar`, null);
  }

  desactivar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.url}/${id}/desactivar`, null);
  }
}
