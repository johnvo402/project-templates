import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AsyncState } from '../../../shared/components/AsyncState';
import { PageHeader } from '../../../shared/components/PageHeader';
import { getErrorMessage } from '../../../shared/utils/http-error';
import { reportsApi } from '../api/reports.api';
import { OrderStatusReportCard } from '../components/OrderStatusReportCard';
import { TopProductsReportCard } from '../components/TopProductsReportCard';

export function ReportsPage() {
  const topProducts = useQuery({ queryKey: ['reports', 'top-products'], queryFn: reportsApi.topProducts });
  const statuses = useQuery({ queryKey: ['reports', 'orders-by-status'], queryFn: reportsApi.ordersByStatus });
  const loading = topProducts.isLoading || statuses.isLoading;
  const error = topProducts.isError ? getErrorMessage(topProducts.error) : statuses.isError ? getErrorMessage(statuses.error) : null;
  const refresh = () => { void topProducts.refetch(); void statuses.refetch(); };

  return <Box component="section"><PageHeader eyebrow="Analytics" title="Reports" description="Focused business signals without turning the starter into an ERP." actions={<Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={refresh} disabled={topProducts.isFetching || statuses.isFetching}>Refresh</Button>} /><AsyncState loading={loading} error={error} onRetry={refresh} />{!loading && !error && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1.25fr) minmax(320px,.75fr)' }, gap: 2 }}><TopProductsReportCard rows={topProducts.data ?? []} /><OrderStatusReportCard rows={statuses.data ?? []} /></Box>}</Box>;
}
