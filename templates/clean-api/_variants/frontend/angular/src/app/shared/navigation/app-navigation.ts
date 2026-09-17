import { AuthUser } from '../../core/auth/auth-session.service';

export type AppNavigationItem = {
  label: string;
  path: string;
  group: string;
  permission?: string;
};

export const APP_NAVIGATION: readonly AppNavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', group: 'Overview', permission: 'dashboard.view' },
  { label: 'Orders', path: '/orders', group: 'Sales', permission: 'orders.view' },
  { label: 'Products', path: '/products', group: 'Sales', permission: 'products.view' },
  { label: 'Employees', path: '/employees', group: 'Management', permission: 'employees.view' },
  { label: 'Reports', path: '/reports', group: 'Analytics', permission: 'reports.view' },
  { label: 'Settings', path: '/settings', group: 'System', permission: 'settings.view' },
  { label: 'Profile', path: '/profile', group: 'Account' },
//#if (ai != "none")
  { label: 'AI Assistant', path: '/ai', group: 'Account', permission: 'ai.generate' },
//#endif
];

export function visibleNavigation(user: AuthUser): AppNavigationItem[] {
  return APP_NAVIGATION.filter(item => !item.permission || user.permissions.includes(item.permission));
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
