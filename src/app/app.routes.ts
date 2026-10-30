import { Routes } from '@angular/router';
import { LayoutPrincipalComponent } from '@shared/ui/templates';

/** Cada módulo funcional se carga bajo demanda (lazy loading). */
export const routes: Routes = [
  {
    path: '',
    component: LayoutPrincipalComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'pedidos' },
      {
        path: 'pedidos',
        loadChildren: () => import('@features/pedidos/pedidos.routes').then((m) => m.PEDIDOS_ROUTES),
      },
      {
        path: 'productos',
        loadChildren: () =>
          import('@features/productos/productos.routes').then((m) => m.PRODUCTOS_ROUTES),
      },
      {
        path: '**',
        title: 'No encontrado',
        loadComponent: () =>
          import('@features/sistema/no-encontrado.page').then((m) => m.NoEncontradoPage),
      },
    ],
  },
];
