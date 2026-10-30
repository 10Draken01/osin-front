import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BotonComponent } from '@shared/ui/atoms';
import { EstadoVacioComponent } from '@shared/ui/molecules';

@Component({
  selector: 'app-no-encontrado-page',
  imports: [RouterLink, BotonComponent, EstadoVacioComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-estado-vacio
      icono="alerta"
      titulo="Esta página no existe"
      descripcion="Revisa la dirección o vuelve al listado de pedidos."
    >
      <a uiBoton variante="primario" routerLink="/pedidos">Ver pedidos</a>
    </ui-estado-vacio>
  `,
})
export class NoEncontradoPage {}
