import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button, MenuItem, Pagination, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { AuthUser } from '../../../core/auth/auth-session';
import { can } from '../../../core/auth/auth-session';
import { AsyncState } from '../../../components/AsyncState';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { PageHeader } from '../../../components/PageHeader';
import { useNotifications } from '../../../feedback/NotificationProvider';
import { type ListQuery, type ListFilter } from '../../../core/api/list-query';
import { getErrorMessage } from '../../../core/api/http-error';
import { ordersApi } from '../api/orders.api';
import { OrderDetailDialog } from '../components/OrderDetailDialog';
import { OrderFilters } from '../components/OrderFilters';
import { OrderFormDialog } from '../components/OrderFormDialog';
import { OrdersGrid } from '../components/OrdersGrid';
import type { CreateOrderModel, MutableOrderStatus, Order, OrderFilterState } from '../order.models';

type Props = { user: AuthUser };

const initialFilters: OrderFilterState = { keyword: '', sort: '', status: '', minTotal: '' };
const initialQuery: ListQuery = { page: 1, pageSize: 20 };
const pageSizes = [10, 20, 50, 100];

export function OrdersPage({ user }: Props) {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const [query, setQuery] = useState<ListQuery>(initialQuery);
  const [filters, setFilters] = useState<OrderFilterState>(initialFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const orders = useQuery({ queryKey: ['orders', query], queryFn: () => ordersApi.list(query) });
  const detail = useQuery({ queryKey: ['orders', 'detail', detailId], queryFn: () => ordersApi.detail(detailId!), enabled: Boolean(detailId) });
  const activeProducts = useQuery({
    queryKey: ['orders', 'active-products'],
    queryFn: ordersApi.activeProducts,
    enabled: formOpen,
    staleTime: 30_000,
  });

  const createOrder = useMutation({
    mutationFn: (model: CreateOrderModel) => ordersApi.create(model),
    onSuccess: async () => {
      notifications.success('Order created.');
      setFormOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
    },
    onError: error => notifications.error(getErrorMessage(error)),
  });

  const updateStatus = useMutation({
    mutationFn: ({ order, status }: { order: Order; status: MutableOrderStatus }) => ordersApi.updateStatus(order.id, status),
    onSuccess: async (_, variables) => {
      notifications.success(`Order moved to ${variables.status}.`);
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: error => notifications.error(getErrorMessage(error)),
  });

  const cancelOrder = useMutation({
    mutationFn: (order: Order) => ordersApi.cancel(order.id),
    onSuccess: async () => {
      notifications.success('Order cancelled.');
      setCancelTarget(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);
    },
    onError: error => notifications.error(getErrorMessage(error)),
  });

  const applyFilters = () => {
    const lhs: ListFilter[] = [];
    if (filters.status) lhs.push({ field: 'Status', operator: '$eqi', value: filters.status });
    if (filters.minTotal.trim()) lhs.push({ field: 'TotalAmount', operator: '$gte', value: Math.max(0, Number(filters.minTotal)) });
    setQuery(current => ({ ...current, page: 1, keyword: filters.keyword.trim() || undefined, targets: ['OrderNumber', 'CustomerName', 'CustomerPhone'], sort: filters.sort || undefined, filters: lhs }));
  };

  const clearFilters = () => { setFilters(initialFilters); setQuery(current => ({ page: 1, pageSize: current.pageSize })); };

  const page = orders.data;
  const currentPage = page?.paging?.currentPage ?? query.page;
  const totalPages = page?.paging?.totalPage ?? 0;
  const busy = updateStatus.isPending || cancelOrder.isPending;

  return (
    <Box component="section">
      <PageHeader eyebrow="Sales" title="Orders" description="Create orders and move them through fulfillment." actions={<><Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => void orders.refetch()} disabled={orders.isFetching}>Refresh</Button>{can(user, 'orders.create') && <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setFormOpen(true)}>New order</Button>}</>} />
      <OrderFilters value={filters} onChange={setFilters} onApply={applyFilters} onClear={clearFilters} />
      <AsyncState loading={orders.isLoading} error={orders.isError ? getErrorMessage(orders.error) : null} empty={!orders.isLoading && !orders.isError && (page?.data.length ?? 0) === 0} emptyTitle="No orders yet" emptyMessage="Create the first order or adjust the current filters." onRetry={() => void orders.refetch()} />
      {page && page.data.length > 0 && <><OrdersGrid orders={page.data} loading={orders.isFetching} busy={busy} canUpdate={can(user, 'orders.update-status')} canCancel={can(user, 'orders.cancel')} onView={order => setDetailId(order.id)} onUpdateStatus={(order, status) => updateStatus.mutate({ order, status })} onCancel={setCancelTarget} />{page.paging && <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mt: 2 }}><Typography variant="body2" color="text.secondary">{totalPages ? `Page ${currentPage} of ${totalPages}` : 'No results'}</Typography><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}><TextField select size="small" label="Rows" value={query.pageSize} onChange={event => setQuery(current => ({ ...current, page: 1, pageSize: Number(event.target.value) }))} sx={{ width: 100 }}>{pageSizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}</TextField><Pagination count={Math.max(1, totalPages)} page={Math.max(1, currentPage)} onChange={(_, nextPage) => setQuery(current => ({ ...current, page: nextPage }))} disabled={totalPages <= 1} /></Box></Box>}</>}
      <OrderFormDialog open={formOpen} products={activeProducts.data?.data ?? []} productsLoading={activeProducts.isLoading || activeProducts.isFetching} productsError={activeProducts.isError ? getErrorMessage(activeProducts.error) : null} busy={createOrder.isPending} onClose={() => setFormOpen(false)} onSubmit={model => createOrder.mutate(model)} />
      <OrderDetailDialog open={Boolean(detailId)} order={detail.data} loading={detail.isLoading || detail.isFetching} error={detail.isError ? getErrorMessage(detail.error) : null} onClose={() => setDetailId(null)} />
      <ConfirmDialog open={Boolean(cancelTarget)} title="Cancel order?" description={cancelTarget ? `Cancel ${cancelTarget.orderNumber}? Reserved stock will be restored.` : ''} confirmLabel="Cancel order" destructive busy={cancelOrder.isPending} onClose={() => setCancelTarget(null)} onConfirm={() => { if (cancelTarget) cancelOrder.mutate(cancelTarget); }} />
    </Box>
  );
}
