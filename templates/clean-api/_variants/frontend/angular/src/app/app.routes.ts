import { Routes } from '@angular/router';
import { BUSINESS_ROUTES, FALLBACK_ROUTES } from './features/business/business.routes';

export const appRoutes: Routes = [...BUSINESS_ROUTES, ...FALLBACK_ROUTES];
