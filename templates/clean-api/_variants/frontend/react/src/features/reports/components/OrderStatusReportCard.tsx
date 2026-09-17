import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import type { OrderStatusReport } from '../report.models';

export function OrderStatusReportCard({ rows }: { rows: OrderStatusReport[] }) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}><Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Orders by status</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Current order distribution.</Typography><Stack spacing={2}>{rows.map(row => { const percent = total ? (row.count / total) * 100 : 0; return <Box key={row.status}><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: .75 }}><Typography variant="body2">{row.status}</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{row.count}</Typography></Box><LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 999 }} /></Box>; })}{!rows.length && <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No order status data yet.</Typography>}</Stack></Paper>;
}
