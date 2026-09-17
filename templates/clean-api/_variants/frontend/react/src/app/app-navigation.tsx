import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import type { ReactNode } from 'react';
import { can, type AuthUser } from '../core/auth/auth-session';

export type OptionalNavigationFeature = 'product-images' | 'ai';

export type AppNavigationItem = {
  label: string;
  path: string;
  group: string;
  icon: ReactNode;
  permission?: string;
  optionalFeature?: OptionalNavigationFeature;
};

export type NavigationOptions = {
  productImages?: boolean;
  ai?: boolean;
};

export const appNavigation: readonly AppNavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', group: 'Overview', permission: 'dashboard.view', icon: <DashboardOutlinedIcon /> },
  { label: 'Orders', path: '/orders', group: 'Sales', permission: 'orders.view', icon: <ReceiptLongOutlinedIcon /> },
  { label: 'Products', path: '/products', group: 'Sales', permission: 'products.view', icon: <Inventory2OutlinedIcon /> },
  { label: 'Product Images', path: '/products/images', group: 'Sales', permission: 'products.view', optionalFeature: 'product-images', icon: <ImageOutlinedIcon /> },
  { label: 'Employees', path: '/employees', group: 'Management', permission: 'employees.view', icon: <GroupsOutlinedIcon /> },
  { label: 'Reports', path: '/reports', group: 'Analytics', permission: 'reports.view', icon: <BarChartOutlinedIcon /> },
  { label: 'Settings', path: '/settings', group: 'System', permission: 'settings.view', icon: <SettingsOutlinedIcon /> },
  { label: 'Profile', path: '/profile', group: 'Account', icon: <AccountCircleOutlinedIcon /> },
  { label: 'AI Assistant', path: '/ai', group: 'Account', permission: 'ai.generate', optionalFeature: 'ai', icon: <AutoAwesomeOutlinedIcon /> },
];

export function getVisibleNavigation(user: AuthUser, options: NavigationOptions): AppNavigationItem[] {
  return appNavigation.filter(item => {
    if (item.permission && !can(user, item.permission)) return false;
    if (item.optionalFeature === 'product-images' && !options.productImages) return false;
    if (item.optionalFeature === 'ai' && !options.ai) return false;
    return true;
  });
}

export function getDefaultPath(items: readonly AppNavigationItem[]): string {
  return items.find(item => item.path === '/dashboard')?.path ?? items[0]?.path ?? '/profile';
}
