import { ESTADOS_PEDIDO, EstadoPedido, NuevaPartida, Pedido } from '../../../domain/models/pedido.model';
import { PedidoRequestDto, PedidoResponseDto } from '../dto/pedido.dto';

export const PedidoMapper = {
  aDominio(dto: PedidoResponseDto): Pedido {
    return {
      id: dto.id,
      folio: dto.folio,
      estado: aEstado(dto.estado),
      total: Number(dto.total),
      fechaCreacion: aFecha(dto.fechaCreacion) ?? new Date(NaN),
      fechaActualizacion: aFecha(dto.fechaActualizacion) ?? new Date(NaN),
      fechaCancelacion: aFecha(dto.fechaCancelacion),
      partidas: (dto.productos ?? []).map((p) => ({
        idProducto: p.idProducto,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precioUnitario: Number(p.precioUnitario),
        subtotal: Number(p.subtotal),
      })),
    };
  },

  aRequest(partidas: readonly NuevaPartida[]): PedidoRequestDto {
    return { productos: partidas.map((p) => ({ id: p.idProducto, cantidad: p.cantidad })) };
  },
};

function aEstado(valor: string): EstadoPedido {
  const estado = ESTADOS_PEDIDO.find((e) => e === valor);
  if (!estado) throw new Error(`Estado de pedido desconocido: ${valor}`);
  return estado;
}

/**
 * LocalDateTime llega sin zona horaria: se interpreta como hora local (la del servidor y la tienda).
 * Se recortan los microsegundos porque Date solo maneja milisegundos.
 */
export function aFecha(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const recortado = valor.replace(/(\.\d{3})\d+/, '$1');
  const fecha = new Date(recortado);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}
