import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
//#if (ai != "none")
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
//#endif
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
//#if (minio)
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
//#endif
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import type { ReactNode } from 'react';
import { can, type AuthUser } from '../core/auth/auth-session';

export type AppNavigationItem = {
  label: string;
  path: string;
  group: string;
  icon: ReactNode;
  permission?: string;
};

export const appNavigation: readonly AppNavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', group: 'Overview', permission: 'dashboard.view', icon: <DashboardOutlinedIcon /> },
  { label: 'Orders', path: '/orders', group: 'Sales', permission: 'orders.view', icon: <ReceiptLongOutlinedIcon /> },
  { label: 'Products', path: '/products', group: 'Sales', permission: 'products.view', icon: <Inventory2OutlinedIcon /> },
//#if (minio)
  { label: 'Product Images', path: '/products/images', group: 'Sales', permission: 'products.view', icon: <ImageOutlinedIcon /> },
//#endif
  { label: 'Employees', path: '/employees', group: 'Management', permission: 'employees.view', icon: <GroupsOutlinedIcon /> },
  { label: 'Reports', path: '/reports', group: 'Analytics', permission: 'reports.view', icon: <BarChartOutlinedIcon /> },
  { label: 'Settings', path: '/settings', group: 'System', permission: 'settings.view', icon: <SettingsOutlinedIcon /> },
  { label: 'Profile', path: '/profile', group: 'Account', icon: <AccountCircleOutlinedIcon /> },
//#if (ai != "none")
  { label: 'AI Assistant', path: '/ai', group: 'Account', permission: 'ai.generate', icon: <AutoAwesomeOutlinedIcon /> },
//#endif
];

export function getVisibleNavigation(user: AuthUser): AppNavigationItem[] {
  return appNavigation.filter(item => !item.permission || can(user, item.permission));
}

export function getDefaultPath(items: readonly AppNavigationItem[]): string {
  return items.find(item => item.path === '/dashboard')?.path ?? items[0]?.path ?? '/profile';
}
