/** Espejo de PedidoRequest / PedidoResponse / ProductoDatos / PedidoDetallesDatos del backend. */
export interface ProductoDatosDto {
  id: number;
  cantidad: number;
}

export interface PedidoRequestDto {
  productos: ProductoDatosDto[];
}

export interface PedidoDetallesDatosDto {
  idProducto: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoResponseDto {
  id: number;
  folio: string;
  productos: PedidoDetallesDatosDto[];
  estado: string;
  total: number;
  /** LocalDateTime serializado sin zona, p. ej. "2026-10-30T07:41:12.345678". */
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaCancelacion: string | null;
}
