import { Routes, UrlMatcher } from '@angular/router';

/** Solo ids numéricos; cualquier otra cosa cae en la página de no encontrado. */
const idNumerico =
  (sufijo?: string): UrlMatcher =>
  (segmentos) => {
    const esperado = sufijo ? 2 : 1;
    if (segmentos.length !== esperado || !/^\d+$/.test(segmentos[0].path)) return null;
    if (sufijo && segmentos[1].path !== sufijo) return null;
    return { consumed: segmentos, posParams: { id: segmentos[0] } };
  };

const formulario = () =>
  import('./pages/pedido-formulario.page').then((m) => m.PedidoFormularioPage);

export const PEDIDOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Pedidos',
    loadComponent: () => import('./pages/pedidos-lista.page').then((m) => m.PedidosListaPage),
  },
  { path: 'nuevo', title: 'Nuevo pedido', loadComponent: formulario },
  { matcher: idNumerico('editar'), title: 'Editar pedido', loadComponent: formulario },
  {
    matcher: idNumerico(),
    title: 'Detalle de pedido',
    loadComponent: () => import('./pages/pedido-detalle.page').then((m) => m.PedidoDetallePage),
  },
];
