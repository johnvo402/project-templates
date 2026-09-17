import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AsyncState } from '../../../components/AsyncState';
import { PageHeader } from '../../../components/PageHeader';
import { formatCurrency } from '../../../utils/formatters';
import { getErrorMessage } from '../../../core/api/http-error';
import { dashboardApi } from '../api/dashboard.api';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import { RecentOrdersPanel } from '../components/RecentOrdersPanel';
import { TopProductsPanel } from '../components/TopProductsPanel';

export function DashboardPage() {
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get, refetchInterval: 30_000 });
  const data = dashboard.data;
  const metrics = data ? [
    { label: 'Revenue today', value: formatCurrency(data.revenueToday), helper: 'Current day' },
    { label: 'Revenue this month', value: formatCurrency(data.revenueThisMonth), helper: 'Month to date' },
    { label: 'Orders', value: data.totalOrders },
    { label: 'Pending orders', value: data.pendingOrders },
    { label: 'Products', value: data.totalProducts },
    { label: 'Low stock', value: data.lowStockProducts },
    { label: 'Employees', value: data.totalEmployees },
  ] : [];

  return (
    <Box component="section">
      <PageHeader eyebrow="Overview" title="Dashboard" description="Live operational snapshot. Data refreshes directly every 30 seconds." actions={<Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => void dashboard.refetch()} disabled={dashboard.isFetching}>Refresh</Button>} />
      <AsyncState loading={dashboard.isLoading} error={dashboard.isError ? getErrorMessage(dashboard.error) : null} onRetry={() => void dashboard.refetch()} />
      {data && <><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 2, mb: 2 }}>{metrics.map(metric => <DashboardMetricCard key={metric.label} {...metric} />)}</Box><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2,minmax(0,1fr))' }, gap: 2 }}><TopProductsPanel products={data.topProducts} /><RecentOrdersPanel orders={data.recentOrders} /></Box></>}
    </Box>
  );
}
