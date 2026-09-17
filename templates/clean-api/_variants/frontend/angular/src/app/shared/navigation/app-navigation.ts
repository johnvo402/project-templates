import { AuthUser } from '../../core/auth/auth-session.service';

export type OptionalNavigationFeature = 'product-images' | 'ai';

export type AppNavigationItem = {
  label: string;
  path: string;
  group: string;
  permission?: string;
  optionalFeature?: OptionalNavigationFeature;
};

export type NavigationOptions = {
  productImages: boolean;
  ai: boolean;
};

export const APP_NAVIGATION: readonly AppNavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', group: 'Overview', permission: 'dashboard.view' },
  { label: 'Orders', path: '/orders', group: 'Sales', permission: 'orders.view' },
  { label: 'Products', path: '/products', group: 'Sales', permission: 'products.view' },
  { label: 'Product Images', path: '/products/images', group: 'Sales', permission: 'products.view', optionalFeature: 'product-images' },
  { label: 'Employees', path: '/employees', group: 'Management', permission: 'employees.view' },
  { label: 'Reports', path: '/reports', group: 'Analytics', permission: 'reports.view' },
  { label: 'Settings', path: '/settings', group: 'System', permission: 'settings.view' },
  { label: 'Profile', path: '/profile', group: 'Account' },
  { label: 'AI Assistant', path: '/ai', group: 'Account', permission: 'ai.generate', optionalFeature: 'ai' },
];

export function visibleNavigation(user: AuthUser, options: NavigationOptions): AppNavigationItem[] {
  return APP_NAVIGATION.filter(item => {
    if (item.permission && !user.permissions.includes(item.permission)) return false;
    if (item.optionalFeature === 'product-images' && !options.productImages) return false;
    if (item.optionalFeature === 'ai' && !options.ai) return false;
    return true;
  });
}

export function groupNavigation(items: readonly AppNavigationItem[]) {
  return items.reduce<{ name: string; items: AppNavigationItem[] }[]>((groups, item) => {
    let group = groups.find(candidate => candidate.name === item.group);
    if (!group) {
      group = { name: item.group, items: [] };
      groups.push(group);
    }
    group.items.push(item);
    return groups;
  }, []);
}
