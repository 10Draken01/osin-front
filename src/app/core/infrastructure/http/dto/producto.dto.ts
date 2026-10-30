/** Espejo exacto de ProductoRequest / ProductoResponse del backend. Solo se usan en infraestructura. */
export interface ProductoRequestDto {
  nombre: string;
  descripcion: string | null;
  precioUnitario: number;
  existencia: number;
}

export interface ProductoResponseDto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precioUnitario: number;
  existencia: number;
  activo: boolean;
}
