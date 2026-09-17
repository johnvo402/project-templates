import { Routes } from '@angular/router';
import { permissionGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [permissionGuard('dashboard.view')],
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard.page').then((m) => m.DashboardPage)
  },
  {
    path: 'products',
    canActivate: [permissionGuard('products.view')],
    loadComponent: () =>
      import('./features/products/pages/products.page').then((m) => m.ProductsPage)
  },
  {
    path: 'orders',
    canActivate: [permissionGuard('orders.view')],
    loadComponent: () =>
      import('./features/orders/pages/orders.page').then((m) => m.OrdersPage)
  },
  {
    path: 'employees',
    canActivate: [permissionGuard('employees.view')],
    loadComponent: () =>
      import('./features/employees/pages/employees.page').then((m) => m.EmployeesPage)
  },
  {
    path: 'reports',
    canActivate: [permissionGuard('reports.view')],
    loadComponent: () =>
      import('./features/reports/pages/reports.page').then((m) => m.ReportsPage)
  },
  {
    path: 'settings',
    canActivate: [permissionGuard('settings.view')],
    loadComponent: () =>
      import('./features/settings/pages/settings.page').then((m) => m.SettingsPage)
  },
  { path: '**', redirectTo: '' }
];
