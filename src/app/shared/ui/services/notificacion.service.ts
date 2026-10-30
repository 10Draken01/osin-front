import { Injectable, signal } from '@angular/core';

export type TonoNotificacion = 'exito' | 'error' | 'info';

export interface Notificacion {
  readonly id: number;
  readonly tono: TonoNotificacion;
  readonly mensaje: string;
}

/** Avisos breves (toasts) para confirmar que una acción terminó. Patrón Observer con signals. */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private siguienteId = 1;
  private readonly _notificaciones = signal<readonly Notificacion[]>([]);
  readonly notificaciones = this._notificaciones.asReadonly();

  exito(mensaje: string): void {
    this.mostrar('exito', mensaje, 4000);
  }

  error(mensaje: string): void {
    this.mostrar('error', mensaje, 8000);
  }

  info(mensaje: string): void {
    this.mostrar('info', mensaje, 5000);
  }

  descartar(id: number): void {
    this._notificaciones.update((lista) => lista.filter((n) => n.id !== id));
  }

  private mostrar(tono: TonoNotificacion, mensaje: string, duracionMs: number): void {
    const id = this.siguienteId++;
    // Máximo 3 a la vez para no tapar la pantalla
    this._notificaciones.update((lista) => [...lista.slice(-2), { id, tono, mensaje }]);
    setTimeout(() => this.descartar(id), duracionMs);
  }
}
