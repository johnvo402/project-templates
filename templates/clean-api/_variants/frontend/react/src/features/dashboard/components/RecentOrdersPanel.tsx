import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import type { DashboardRecentOrder } from '../dashboard.models';

type Props = { orders: DashboardRecentOrder[] };

function statusColor(status: string): 'default' | 'warning' | 'info' | 'success' | 'error' {
  switch (status.toLowerCase()) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
}

export function RecentOrdersPanel({ orders }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, minHeight: 320 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent orders</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Latest customer activity.</Typography>
      <Stack divider={<Divider flexItem />}>
        {orders.slice(0, 6).map(order => (
          <Box key={order.id} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 1.5, py: 1.25, alignItems: 'center' }}>
            <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 650 }}>{order.orderNumber} · {order.customerName}</Typography><Typography variant="caption" color="text.secondary">{formatDateTime(order.createdAt)} · {formatCurrency(order.totalAmount)}</Typography></Box>
            <Chip size="small" label={order.status} color={statusColor(order.status)} />
          </Box>
        ))}
        {!orders.length && <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No orders yet.</Typography>}
      </Stack>
    </Paper>
  );
}
