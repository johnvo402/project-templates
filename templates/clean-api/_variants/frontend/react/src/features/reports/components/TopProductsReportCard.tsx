import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';
import type { TopProductReport } from '../report.models';

export function TopProductsReportCard({ rows }: { rows: TopProductReport[] }) {
  return <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, overflow: 'hidden' }}><Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Top products</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Quantity and revenue across the strongest products.</Typography><Table size="small"><TableHead><TableRow><TableCell>Product</TableCell><TableCell align="right">Qty</TableCell><TableCell align="right">Revenue</TableCell></TableRow></TableHead><TableBody>{rows.map(row => <TableRow key={row.productName}><TableCell>{row.productName}</TableCell><TableCell align="right">{row.quantity}</TableCell><TableCell align="right">{formatCurrency(row.revenue)}</TableCell></TableRow>)}</TableBody></Table>{!rows.length && <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No product report data yet.</Typography>}</Paper>;
}
