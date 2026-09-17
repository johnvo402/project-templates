import { Routes } from '@angular/router';
import { permissionGuard } from './core/auth/permission.guard';
import { BUSINESS_ROUTES, FALLBACK_ROUTES } from './features/business/business.routes';
import { ProductImagesWorkspaceComponent } from './features/products/product-images-workspace.component';

export const appRoutes:Routes=[...BUSINESS_ROUTES,{path:'products/images',component:ProductImagesWorkspaceComponent,canActivate:[permissionGuard],data:{permission:'products.view'}},...FALLBACK_ROUTES];
