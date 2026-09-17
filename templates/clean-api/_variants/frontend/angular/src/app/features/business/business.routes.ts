import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/auth/permission.guard';
import { BusinessWorkspaceComponent } from './business-workspace.component';

export const BUSINESS_ROUTES: Routes = [
  { path: 'dashboard', title: 'Dashboard', component: BusinessWorkspaceComponent, canActivate: [permissionGuard], data: { section: 'dashboard', permission: 'dashboard.view' } },
  { path: 'orders', title: 'Orders', component: BusinessWorkspaceComponent, canActivate: [permissionGuard], data: { section: 'orders', permission: 'orders.view' } },
  { path: 'products', title: 'Products', loadComponent: () => import('../products/pages/products.page').then(module => module.ProductsPage), canActivate: [permissionGuard], data: { permission: 'products.view' } },
  { path: 'employees', title: 'Employees', component: BusinessWorkspaceComponent, canActivate: [permissionGuard], data: { section: 'employees', permission: 'employees.view' } },
  { path: 'reports', title: 'Reports', component: BusinessWorkspaceComponent, canActivate: [permissionGuard], data: { section: 'reports', permission: 'reports.view' } },
  { path: 'settings', title: 'Settings', component: BusinessWorkspaceComponent, canActivate: [permissionGuard], data: { section: 'settings', permission: 'settings.view' } },
  { path: 'profile', title: 'Profile', component: BusinessWorkspaceComponent, canActivate: [permissionGuard], data: { section: 'profile' } },
];

export const FALLBACK_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'profile' },
];
