import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button, MenuItem, Pagination, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { AuthUser } from '../../../core/auth/auth-session';
import { can } from '../../../core/auth/auth-session';
import { AsyncState } from '../../../shared/components/AsyncState';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { PageHeader } from '../../../shared/components/PageHeader';
import { useNotifications } from '../../../shared/feedback/NotificationProvider';
import { getErrorMessage } from '../../../shared/utils/http-error';
import { type BusinessListQuery, type ListFilter } from '../../business/business-query';
import { ordersApi } from '../api/orders.api';
import { OrderFilters } from '../components/OrderFilters';
import { OrderFormDialog } from '../components/OrderFormDialog';
import { OrdersGrid } from '../components/OrdersGrid';
import type { CreateOrderModel, MutableOrderStatus, Order, OrderFilterState } from '../order.models';

type Props = { user: AuthUser };

const initialFilters: OrderFilterState = { keyword: '', sort: '', status: '', minTotal: '' };
const initialQuery: BusinessListQuery = { page: 1, pageSize: 20 };
const pageSizes = [10, 20, 50, 100];

export function OrdersPage({ user }: Props) {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const [query, setQuery] = useState<BusinessListQuery>(initialQuery);
  const [filters, setFilters] = useState<OrderFilterState>(initialFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const orders = useQuery({ queryKey: ['orders', query], queryFn: () => ordersApi.list(query) });
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
    setQuery(current => ({
      ...current,
      page: 1,
      keyword: filters.keyword.trim() || undefined,
      targets: ['OrderNumber', 'CustomerName', 'CustomerPhone'],
      sort: filters.sort || undefined,
      filters: lhs,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setQuery(current => ({ page: 1, pageSize: current.pageSize }));
  };

  const page = orders.data;
  const currentPage = page?.paging?.currentPage ?? query.page;
  const totalPages = page?.paging?.totalPage ?? 0;
  const busy = updateStatus.isPending || cancelOrder.isPending;

  return (
    <Box component="section">
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        description="Create orders and move them through fulfillment."
        actions={(
          <>
            <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => void orders.refetch()} disabled={orders.isFetching}>Refresh</Button>
            {can(user, 'orders.create') && <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setFormOpen(true)}>New order</Button>}
          </>
        )}
      />

      <OrderFilters value={filters} onChange={setFilters} onApply={applyFilters} onClear={clearFilters} />

      <AsyncState
        loading={orders.isLoading}
        error={orders.isError ? getErrorMessage(orders.error) : null}
        empty={!orders.isLoading && !orders.isError && (page?.data.length ?? 0) === 0}
        emptyTitle="No orders yet"
        emptyMessage="Create the first order or adjust the current filters."
        onRetry={() => void orders.refetch()}
      />

      {page && page.data.length > 0 && (
        <>
          <OrdersGrid
            orders={page.data}
            loading={orders.isFetching}
            busy={busy}
            canUpdate={can(user, 'orders.update-status')}
            canCancel={can(user, 'orders.cancel')}
            onUpdateStatus={(order, status) => updateStatus.mutate({ order, status })}
            onCancel={setCancelTarget}
          />
          {page.paging && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mt: 2 }}>
              <Typography variant="body2" color="text.secondary">{totalPages ? `Page ${currentPage} of ${totalPages}` : 'No results'}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <TextField select size="small" label="Rows" value={query.pageSize} onChange={event => setQuery(current => ({ ...current, page: 1, pageSize: Number(event.target.value) }))} sx={{ width: 100 }}>
                  {pageSizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
                </TextField>
                <Pagination count={Math.max(1, totalPages)} page={Math.max(1, currentPage)} onChange={(_, nextPage) => setQuery(current => ({ ...current, page: nextPage }))} disabled={totalPages <= 1} />
              </Box>
            </Box>
          )}
        </>
      )}

      <OrderFormDialog
        open={formOpen}
        products={activeProducts.data?.data ?? []}
        productsLoading={activeProducts.isLoading || activeProducts.isFetching}
        productsError={activeProducts.isError ? getErrorMessage(activeProducts.error) : null}
        busy={createOrder.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={model => createOrder.mutate(model)}
      />
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel order?"
        description={cancelTarget ? `Cancel ${cancelTarget.orderNumber}? Reserved stock will be restored.` : ''}
        confirmLabel="Cancel order"
        destructive
        busy={cancelOrder.isPending}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => { if (cancelTarget) cancelOrder.mutate(cancelTarget); }}
      />
    </Box>
  );
}
