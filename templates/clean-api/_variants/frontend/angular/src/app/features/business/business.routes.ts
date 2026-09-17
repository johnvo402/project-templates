import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/auth/permission.guard';

export const BUSINESS_ROUTES: Routes = [
  { path: 'dashboard', title: 'Dashboard', loadComponent: () => import('../dashboard/pages/dashboard.page').then(module => module.DashboardPage), canActivate: [permissionGuard], data: { permission: 'dashboard.view' } },
  { path: 'orders', title: 'Orders', loadComponent: () => import('../orders/pages/orders.page').then(module => module.OrdersPage), canActivate: [permissionGuard], data: { permission: 'orders.view' } },
  { path: 'products', title: 'Products', loadComponent: () => import('../products/pages/products.page').then(module => module.ProductsPage), canActivate: [permissionGuard], data: { permission: 'products.view' } },
  { path: 'employees', title: 'Employees', loadComponent: () => import('../employees/pages/employees.page').then(module => module.EmployeesPage), canActivate: [permissionGuard], data: { permission: 'employees.view' } },
  { path: 'reports', title: 'Reports', loadComponent: () => import('../reports/pages/reports.page').then(module => module.ReportsPage), canActivate: [permissionGuard], data: { permission: 'reports.view' } },
  { path: 'settings', title: 'Settings', loadComponent: () => import('../settings/pages/settings.page').then(module => module.SettingsPage), canActivate: [permissionGuard], data: { permission: 'settings.view' } },
  { path: 'profile', title: 'Profile', loadComponent: () => import('../profile/profile.page').then(module => module.ProfilePage) },
];

export const FALLBACK_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'profile' },
];
