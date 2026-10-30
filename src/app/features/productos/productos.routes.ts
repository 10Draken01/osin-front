import { Routes } from '@angular/router';

export const PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    title: 'Productos',
    loadComponent: () => import('./pages/productos-lista.page').then((m) => m.ProductosListaPage),
  },
  {
    path: 'nuevo',
    title: 'Nuevo producto',
    loadComponent: () =>
      import('./pages/producto-formulario.page').then((m) => m.ProductoFormularioPage),
  },
  {
    path: ':id/editar',
    title: 'Editar producto',
    loadComponent: () =>
      import('./pages/producto-formulario.page').then((m) => m.ProductoFormularioPage),
  },
];
