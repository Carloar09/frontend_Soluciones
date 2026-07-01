import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'empleados',
    loadComponent: () =>
      import('./features/empleados/lista-empleados/lista-empleados').then(m => m.ListaEmpleados),
    canActivate: [authGuard]
  },
  {
    path: 'empleados/expediente/:dni',
    loadComponent: () =>
      import('./features/empleados/expediente/expediente').then(m => m.Expediente),
    canActivate: [authGuard]
  },
  {
    path: 'sucursales',
    loadComponent: () =>
      import('./features/sucursales/sucursales').then(m => m.Sucursales),
    canActivate: [authGuard]
  },
  {
    path: 'incidencias',
    loadComponent: () =>
      import('./features/incidencias/incidencias').then(m => m.Incidencias),
    canActivate: [authGuard]
  },
  {
    path: 'salidas',
    loadComponent: () =>
      import('./features/salidas/salidas').then(m => m.Salidas),
    canActivate: [authGuard]
  },
  {
  path: 'empleados/nuevo-empleado',
  loadComponent: () =>
    import('./features/empleados/nuevo-empleado').then(m => m.NuevoEmpleado),   
  canActivate: [authGuard]
  },
  {
  path: 'busqueda',
  loadComponent: () =>
    import('./features/busqueda/busqueda').then(m => m.Busqueda),
  canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  },
];