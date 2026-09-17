import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AsyncState } from '../../../components/AsyncState';
import { PageHeader } from '../../../components/PageHeader';
import { getErrorMessage } from '../../../core/api/http-error';
import { formatCurrency, getConfiguredCurrency } from '../../../utils/formatters';
import { dashboardApi } from '../api/dashboard.api';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import { TopProductsPanel } from '../components/TopProductsPanel';
import type { DashboardRevenuePoint } from '../dashboard.models';

function RevenueTrendPanel({ points }: { points: DashboardRevenuePoint[] }) {
  const visible = points.slice(-30);
  const max = Math.max(1, ...visible.map(point => point.revenue));

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, minHeight: 320 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Revenue trend</Typography>
      <Typography variant="body2" color="text.secondary">Last 30 days in {getConfiguredCurrency()}.</Typography>
      {visible.length ? (
        <>
          <Box sx={{ height: 210, display: 'flex', alignItems: 'flex-end', gap: 0.75, pt: 3, overflowX: 'auto' }}>
            {visible.map(point => {
              const height = point.revenue <= 0 ? 2 : Math.max(6, (point.revenue / max) * 100);
              return (
                <Box
                  key={point.date}
                  title={`${point.date}: ${formatCurrency(point.revenue)}`}
                  sx={{ flex: '1 0 9px', minWidth: 9, maxWidth: 22, height: `${height}%`, bgcolor: 'primary.main', borderRadius: '6px 6px 2px 2px', opacity: 0.85 }}
                />
              );
            })}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 1 }}>
            <Typography variant="caption" color="text.secondary">{visible[0]?.date}</Typography>
            <Typography variant="caption" color="text.secondary">{visible.at(-1)?.date}</Typography>
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>No revenue data yet.</Typography>
      )}
    </Paper>
  );
}

export function DashboardPage() {
  const dashboard = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get, refetchInterval: 30_000 });
  const data = dashboard.data;
  const rollingRevenue = data?.revenue.reduce((sum, point) => sum + point.revenue, 0) ?? 0;
  const metrics = data ? [
    { label: 'Revenue today', value: formatCurrency(data.revenueToday), helper: 'Current day' },
    { label: 'Revenue this month', value: formatCurrency(data.revenueThisMonth), helper: 'Month to date' },
    { label: '30-day revenue', value: formatCurrency(rollingRevenue), helper: 'Rolling 30-day window' },
    { label: 'Daily average', value: formatCurrency(rollingRevenue / 30), helper: 'Average over 30 days' },
  ] : [];

  return (
    <Box component="section">
      <PageHeader
        eyebrow="Financial overview"
        title="Dashboard"
        description={`Revenue and sales performance. Monetary values follow Settings → Currency (${getConfiguredCurrency()}).`}
        actions={<Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => void dashboard.refetch()} disabled={dashboard.isFetching}>Refresh</Button>}
      />
      <AsyncState loading={dashboard.isLoading} error={dashboard.isError ? getErrorMessage(dashboard.error) : null} onRetry={() => void dashboard.refetch()} />
      {data && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 2, mb: 2 }}>
            {metrics.map(metric => <DashboardMetricCard key={metric.label} {...metric} />)}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1.5fr) minmax(320px,1fr)' }, gap: 2 }}>
            <RevenueTrendPanel points={data.revenue} />
            <TopProductsPanel products={data.topProducts} />
          </Box>
        </>
      )}
    </Box>
  );
}
