import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import type { FormEvent } from 'react';
import { FILTER_ENABLED } from '../../../query/business-query';
import { EMPLOYEE_ROLES, type EmployeeFilterState } from '../employee.models';

type Props = {
  value: EmployeeFilterState;
  onChange: (value: EmployeeFilterState) => void;
  onApply: () => void;
  onClear: () => void;
};

const sorts = [
  ['CreatedAt:desc', 'Newest first'],
  ['DisplayName:asc', 'Name A–Z'],
  ['Email:asc', 'Email A–Z'],
  ['Role:asc', 'Role'],
] as const;

export function EmployeeFilters({ value, onChange, onApply, onClear }: Props) {
  if (!FILTER_ENABLED) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onApply();
  };

  return (
    <Paper component="form" variant="outlined" onSubmit={submit} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(260px,2fr) repeat(3,minmax(150px,1fr))' }, gap: 2 }}>
        <TextField label="Search" value={value.keyword} onChange={event => onChange({ ...value, keyword: event.target.value })} placeholder="Name, email or role" size="small" />
        <TextField select label="Sort" value={value.sort} onChange={event => onChange({ ...value, sort: event.target.value })} size="small">
          <MenuItem value="">Default</MenuItem>
          {sorts.map(([sort, label]) => <MenuItem key={sort} value={sort}>{label}</MenuItem>)}
        </TextField>
        <TextField select label="Role" value={value.role} onChange={event => onChange({ ...value, role: event.target.value })} size="small">
          <MenuItem value="">All</MenuItem>
          {EMPLOYEE_ROLES.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
        </TextField>
        <TextField select label="Status" value={value.status} onChange={event => onChange({ ...value, status: event.target.value })} size="small">
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Active</MenuItem>
          <MenuItem value="false">Disabled</MenuItem>
        </TextField>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 2 }}>
        <Button type="submit" variant="contained">Apply</Button>
        <Button type="button" onClick={onClear}>Clear</Button>
        <Typography variant="caption" color="text.secondary">LHS filters are applied before pagination.</Typography>
      </Box>
    </Paper>
  );
}
