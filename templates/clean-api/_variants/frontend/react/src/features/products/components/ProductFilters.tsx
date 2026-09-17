import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import type { FormEvent } from 'react';
import { FILTER_ENABLED } from '../../../core/api/list-query';
import type { ProductFilterState } from '../product.models';

type Props = {
  value: ProductFilterState;
  onChange: (value: ProductFilterState) => void;
  onApply: () => void;
  onClear: () => void;
};

const sorts = [
  ['UpdatedAt:desc', 'Recently updated'],
  ['Name:asc', 'Name A–Z'],
  ['Price:asc', 'Price low to high'],
  ['Price:desc', 'Price high to low'],
  ['StockQuantity:asc', 'Lowest stock'],
] as const;

export function ProductFilters({ value, onChange, onApply, onClear }: Props) {
  if (!FILTER_ENABLED) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onApply();
  };

  return (
    <Paper component="form" variant="outlined" onSubmit={submit} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(260px,2fr) repeat(3,minmax(150px,1fr))' }, gap: 2 }}>
        <TextField
          label="Search"
          value={value.keyword}
          onChange={event => onChange({ ...value, keyword: event.target.value })}
          placeholder="Name or SKU"
          size="small"
        />
        <TextField
          select
          label="Sort"
          value={value.sort}
          onChange={event => onChange({ ...value, sort: event.target.value })}
          size="small"
        >
          <MenuItem value="">Default</MenuItem>
          {sorts.map(([sort, label]) => <MenuItem key={sort} value={sort}>{label}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="Status"
          value={value.active}
          onChange={event => onChange({ ...value, active: event.target.value })}
          size="small"
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Inactive</MenuItem>
        </TextField>
        <TextField
          label="Stock ≤"
          type="number"
          value={value.lowStock}
          onChange={event => onChange({ ...value, lowStock: event.target.value })}
          size="small"
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
        <Button type="submit" variant="contained">Apply</Button>
        <Button type="button" variant="text" onClick={onClear}>Clear</Button>
        <Typography variant="caption" color="text.secondary">LHS filters are applied before pagination.</Typography>
      </Box>
    </Paper>
  );
}
