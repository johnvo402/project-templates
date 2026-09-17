import { Paper, Typography } from '@mui/material';

type Props = { label: string; value: string | number; helper?: string };

export function DashboardMetricCard({ label, value, helper }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 3, minHeight: 116 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" sx={{ mt: 1, fontWeight: 750, letterSpacing: '-0.02em' }}>{value}</Typography>
      {helper && <Typography variant="caption" color="text.secondary">{helper}</Typography>}
    </Paper>
  );
}
