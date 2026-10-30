import { Pagina } from '../../../domain/models/pagina.model';
import { PaginaDto } from '../dto/pagina.dto';

export function aPagina<D, T>(dto: PaginaDto<D>, mapear: (d: D) => T): Pagina<T> {
  return {
    elementos: dto.content.map(mapear),
    numero: dto.page.number,
    tamano: dto.page.size,
    totalElementos: dto.page.totalElements,
    totalPaginas: dto.page.totalPages,
  };
}
