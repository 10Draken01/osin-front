import { Injectable, signal } from '@angular/core';

export interface SolicitudConfirmacion {
  readonly titulo: string;
  readonly mensaje: string;
  /** Consecuencia de la acción, p. ej. el efecto en el inventario. */
  readonly consecuencia?: string;
  readonly textoConfirmar: string;
  readonly textoCancelar?: string;
  readonly peligro?: boolean;
}

interface DialogoAbierto extends SolicitudConfirmacion {
  readonly responder: (aceptado: boolean) => void;
}

/**
 * Diálogo de confirmación como servicio: cualquier página pide confirmación con
 * `await dialogo.confirmar({...})` sin poner un modal en su propia plantilla.
 * El organismo DialogoConfirmacion, montado una vez en el layout, lo dibuja.
 */
@Injectable({ providedIn: 'root' })
export class DialogoService {
  private readonly _abierto = signal<DialogoAbierto | null>(null);
  readonly abierto = this._abierto.asReadonly();

  confirmar(solicitud: SolicitudConfirmacion): Promise<boolean> {
    this._abierto()?.responder(false);
    return new Promise<boolean>((resolve) => {
      this._abierto.set({ ...solicitud, responder: resolve });
    });
  }

  responder(aceptado: boolean): void {
    const actual = this._abierto();
    if (!actual) return;
    this._abierto.set(null);
    actual.responder(aceptado);
  }
}
