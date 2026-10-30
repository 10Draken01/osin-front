import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, finalize, of, switchMap, tap } from 'rxjs';
import { FiltroPedidos, Pedido } from '@core/domain/models/pedido.model';
import { Pagina, TAMANO_PAGINA_DEFECTO } from '@core/domain/models/pagina.model';
import { AppError } from '@core/domain/errors/app-error';
import { ListarPedidosUseCase } from '@core/application/use-cases/pedidos/listar-pedidos.use-case';

interface Consulta {
  readonly filtro: FiltroPedidos;
  readonly pagina: number;
}

/** Estado del listado de pedidos. Los filtros viven en la URL; este store solo carga. */
@Injectable()
export class PedidosListaStore {
  private readonly listar = inject(ListarPedidosUseCase);

  readonly pagina = signal<Pagina<Pedido> | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<AppError | null>(null);

  private ultima: Consulta = { filtro: { estado: null, folio: null }, pagina: 0 };
  private readonly consultas = new Subject<Consulta>();

  constructor() {
    this.consultas
      .pipe(
        tap(() => {
          this.cargando.set(true);
          this.error.set(null);
        }),
        switchMap((c) =>
          this.listar.execute(c.filtro, { pagina: c.pagina, tamano: TAMANO_PAGINA_DEFECTO }).pipe(
            catchError((e: unknown) => {
              this.error.set(AppError.desde(e));
              return of(null);
            }),
            finalize(() => this.cargando.set(false)),
          ),
        ),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((pagina) => {
        if (pagina) this.pagina.set(pagina);
      });
  }

  cargar(filtro: FiltroPedidos, pagina: number): void {
    this.ultima = { filtro, pagina };
    this.consultas.next(this.ultima);
  }

  recargar(): void {
    this.consultas.next(this.ultima);
  }
}
