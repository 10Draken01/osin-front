/** Formato de Page con spring.data.web.pageable.serialization-mode=via-dto. */
export interface PaginaDto<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}
