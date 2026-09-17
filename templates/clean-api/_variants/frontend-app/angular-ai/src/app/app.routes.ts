import { Routes } from '@angular/router';
import { permissionGuard } from './core/auth/permission.guard';
import { AiPage } from './features/ai/ai.page';
import { BUSINESS_ROUTES, FALLBACK_ROUTES } from './features/business/business.routes';

export const appRoutes:Routes=[...BUSINESS_ROUTES,{path:'ai',component:AiPage,canActivate:[permissionGuard],data:{permission:'ai.generate'}},...FALLBACK_ROUTES];
