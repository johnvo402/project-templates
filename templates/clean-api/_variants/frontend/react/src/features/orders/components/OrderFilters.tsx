import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import type { FormEvent } from 'react';
import { FILTER_ENABLED } from '../../../core/api/list-query';
import type { OrderFilterState } from '../order.models';

type Props = {
  value: OrderFilterState;
  onChange: (value: OrderFilterState) => void;
  onApply: () => void;
  onClear: () => void;
};

const sorts = [
  ['CreatedAt:desc', 'Newest first'],
  ['CreatedAt:asc', 'Oldest first'],
  ['TotalAmount:desc', 'Highest total'],
  ['TotalAmount:asc', 'Lowest total'],
  ['OrderNumber:asc', 'Order number'],
] as const;

const statuses = ['Pending', 'Processing', 'Completed', 'Cancelled'] as const;

export function OrderFilters({ value, onChange, onApply, onClear }: Props) {
  if (!FILTER_ENABLED) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onApply();
  };

  return (
    <Paper component="form" variant="outlined" onSubmit={submit} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(260px,2fr) repeat(3,minmax(150px,1fr))' }, gap: 2 }}>
        <TextField label="Search" value={value.keyword} onChange={event => onChange({ ...value, keyword: event.target.value })} placeholder="Order, customer or phone" size="small" />
        <TextField select label="Sort" value={value.sort} onChange={event => onChange({ ...value, sort: event.target.value })} size="small">
          <MenuItem value="">Default</MenuItem>
          {sorts.map(([sort, label]) => <MenuItem key={sort} value={sort}>{label}</MenuItem>)}
        </TextField>
        <TextField select label="Status" value={value.status} onChange={event => onChange({ ...value, status: event.target.value })} size="small">
          <MenuItem value="">All</MenuItem>
          {statuses.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
        </TextField>
        <TextField label="Total ≥" type="number" value={value.minTotal} onChange={event => onChange({ ...value, minTotal: event.target.value })} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} size="small" />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
        <Button type="submit" variant="contained">Apply</Button>
        <Button type="button" variant="text" onClick={onClear}>Clear</Button>
        <Typography variant="caption" color="text.secondary">LHS filters are applied before pagination.</Typography>
      </Box>
    </Paper>
  );
}
