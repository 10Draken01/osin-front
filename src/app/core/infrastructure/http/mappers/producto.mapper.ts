import { DatosProducto, Producto } from '../../../domain/models/producto.model';
import { ProductoRequestDto, ProductoResponseDto } from '../dto/producto.dto';

export const ProductoMapper = {
  aDominio(dto: ProductoResponseDto): Producto {
    return {
      id: dto.id,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      precioUnitario: Number(dto.precioUnitario),
      existencia: dto.existencia,
      activo: dto.activo === true,
    };
  },

  aRequest(datos: DatosProducto): ProductoRequestDto {
    return {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      precioUnitario: datos.precioUnitario,
      existencia: datos.existencia,
    };
  },
};
