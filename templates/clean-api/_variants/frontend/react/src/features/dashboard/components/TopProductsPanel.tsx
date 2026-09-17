import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import { formatCurrency } from '../../../shared/utils/formatters';
import type { DashboardTopProduct } from '../dashboard.models';

type Props = { products: DashboardTopProduct[] };

export function TopProductsPanel({ products }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, minHeight: 320 }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>Top products</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Best sellers ranked by revenue.</Typography>
      <Stack divider={<Divider flexItem />}>
        {products.slice(0, 6).map((item, index) => (
          <Box key={`${item.productName}-${index}`} sx={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr) auto', gap: 1.5, alignItems: 'center', py: 1.25 }}>
            <Typography variant="body2" color="text.secondary">#{index + 1}</Typography>
            <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 650 }} noWrap>{item.productName}</Typography><Typography variant="caption" color="text.secondary">{item.quantity} sold</Typography></Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatCurrency(item.revenue)}</Typography>
          </Box>
        ))}
        {!products.length && <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No sales data yet.</Typography>}
      </Stack>
    </Paper>
  );
}
