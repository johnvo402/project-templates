import { Routes } from '@angular/router';
import { permissionGuard } from './core/auth/permission.guard';

export const appRoutes: Routes = [
  { path: 'dashboard', title: 'Dashboard', loadComponent: () => import('./features/dashboard/pages/dashboard.page').then(module => module.DashboardPage), canActivate: [permissionGuard], data: { permission: 'dashboard.view' } },
  { path: 'orders', title: 'Orders', loadComponent: () => import('./features/orders/pages/orders.page').then(module => module.OrdersPage), canActivate: [permissionGuard], data: { permission: 'orders.view' } },
  { path: 'products', title: 'Products', loadComponent: () => import('./features/products/pages/products.page').then(module => module.ProductsPage), canActivate: [permissionGuard], data: { permission: 'products.view' } },
  { path: 'employees', title: 'Employees', loadComponent: () => import('./features/employees/pages/employees.page').then(module => module.EmployeesPage), canActivate: [permissionGuard], data: { permission: 'employees.view' } },
  { path: 'reports', title: 'Reports', loadComponent: () => import('./features/reports/pages/reports.page').then(module => module.ReportsPage), canActivate: [permissionGuard], data: { permission: 'reports.view' } },
  { path: 'settings', title: 'Settings', loadComponent: () => import('./features/settings/pages/settings.page').then(module => module.SettingsPage), canActivate: [permissionGuard], data: { permission: 'settings.view' } },
  { path: 'profile', title: 'Profile', loadComponent: () => import('./features/profile/profile.page').then(module => module.ProfilePage) },
  { path: 'ai', title: 'AI', loadComponent: () => import('./features/ai/ai.page').then(module => module.AiPage), canActivate: [permissionGuard], data: { permission: 'ai.generate' } },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'profile' },
];
