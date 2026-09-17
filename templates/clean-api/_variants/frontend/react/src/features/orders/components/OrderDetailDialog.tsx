import { Box, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Button, Stack, Typography } from '@mui/material';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import type { OrderDetail } from '../order.models';

type Props = {
  open: boolean;
  order?: OrderDetail;
  loading: boolean;
  error: string | null;
  onClose: () => void;
};

export function OrderDetailDialog({ open, order, loading, error, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Order detail</DialogTitle>
      <DialogContent dividers>
        {loading && <Typography color="text.secondary">Loading order…</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {order && (
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
              <Box><Typography variant="caption" color="text.secondary">Order</Typography><Typography sx={{ fontWeight: 700 }}>{order.orderNumber}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Status</Typography><Box><Chip size="small" label={order.status} /></Box></Box>
              <Box><Typography variant="caption" color="text.secondary">Customer</Typography><Typography>{order.customerName}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Phone</Typography><Typography>{order.customerPhone || '—'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Created</Typography><Typography>{formatDate(order.createdAt)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Updated</Typography><Typography>{formatDate(order.updatedAt)}</Typography></Box>
            </Box>
            <Divider />
            <Stack spacing={1}>
              {order.items.map(item => (
                <Box key={item.productId} sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 2, alignItems: 'center' }}>
                  <Box><Typography sx={{ fontWeight: 600 }}>{item.productName}</Typography><Typography variant="body2" color="text.secondary">{item.quantity} × {formatCurrency(item.unitPrice)}</Typography></Box>
                  <Typography sx={{ fontWeight: 700 }}>{formatCurrency(item.total)}</Typography>
                </Box>
              ))}
            </Stack>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}><Typography color="text.secondary">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</Typography><Typography variant="h6">{formatCurrency(order.totalAmount)}</Typography></Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
  );
}
