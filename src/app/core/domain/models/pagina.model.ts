/** Resultado paginado, independiente del formato de Spring (`content` + `page`). */
export interface Pagina<T> {
  readonly elementos: readonly T[];
  /** Número de página, empieza en 0 (igual que la API). */
  readonly numero: number;
  readonly tamano: number;
  readonly totalElementos: number;
  readonly totalPaginas: number;
}

export interface SolicitudPagina {
  readonly pagina: number;
  readonly tamano: number;
}

/** La API acepta tamaños de 1 a 100. */
export const TAMANO_PAGINA_MAX = 100;
export const TAMANO_PAGINA_DEFECTO = 10;

/** Evita mandar valores que la API rechazaría con 400 (página negativa, tamaño fuera de 1..100). */
export function normalizarSolicitud(s: SolicitudPagina): SolicitudPagina {
  return {
    pagina: Math.max(0, Math.trunc(s.pagina) || 0),
    tamano: Math.min(TAMANO_PAGINA_MAX, Math.max(1, Math.trunc(s.tamano) || 1)),
  };
}
