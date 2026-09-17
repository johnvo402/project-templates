import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import type { AuthUser } from '../core/auth/auth-session';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { EmployeesPage } from '../features/employees/pages/EmployeesPage';
import { OrdersPage } from '../features/orders/pages/OrdersPage';
import { ProductsPage } from '../features/products/pages/ProductsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { AppShell } from '../shared/components/AppShell';
import { getDefaultPath, getVisibleNavigation } from './app-navigation';

type Props = {
  user: AuthUser;
  onLogout: () => void;
  onProfileUpdated: (displayName: string) => void;
  aiPage?: ReactNode;
  productImagesPage?: ReactNode;
};

export function AuthenticatedApp({ user, onLogout, onProfileUpdated, aiPage, productImagesPage }: Props) {
  const navigation = getVisibleNavigation(user, {
    ai: Boolean(aiPage),
    productImages: Boolean(productImagesPage),
  });
  const hasRoute = (path: string) => navigation.some(item => item.path === path);
  const fallbackPath = getDefaultPath(navigation);

  return (
    <AppShell user={user} navigation={navigation} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Navigate to={fallbackPath} replace />} />
        {hasRoute('/dashboard') && <Route path="/dashboard" element={<DashboardPage />} />}
        {hasRoute('/orders') && <Route path="/orders" element={<OrdersPage user={user} />} />}
        {hasRoute('/products') && <Route path="/products" element={<ProductsPage user={user} />} />}
        {hasRoute('/employees') && <Route path="/employees" element={<EmployeesPage user={user} />} />}
        {hasRoute('/reports') && <Route path="/reports" element={<ReportsPage />} />}
        {hasRoute('/settings') && <Route path="/settings" element={<SettingsPage user={user} />} />}
        {hasRoute('/profile') && <Route path="/profile" element={<ProfilePage user={user} onProfileUpdated={onProfileUpdated} />} />}
        {productImagesPage && hasRoute('/products/images') && <Route path="/products/images" element={productImagesPage} />}
        {aiPage && hasRoute('/ai') && <Route path="/ai" element={aiPage} />}
        <Route path="*" element={<Navigate to={fallbackPath} replace />} />
      </Routes>
    </AppShell>
  );
}
