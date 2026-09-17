import { Avatar, Box, Button, Chip, MenuItem, TextField, Typography } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { formatDate } from '../../../utils/formatters';
import { EMPLOYEE_ROLES, type Employee, type EmployeeRole } from '../employee.models';

type Props = {
  employees: Employee[];
  loading: boolean;
  canUpdate: boolean;
  canChangeRole: boolean;
  onChangeRole: (employee: Employee, role: EmployeeRole) => void;
  onToggleStatus: (employee: Employee) => void;
};

export function EmployeesGrid({ employees, loading, canUpdate, canChangeRole, onChangeRole, onToggleStatus }: Props) {
  const columns: GridColDef<Employee>[] = [
    {
      field: 'displayName',
      headerName: 'Employee',
      flex: 1.4,
      minWidth: 190,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, height: '100%' }}>
          <Avatar src={params.row.avatarUrl ?? undefined} sx={{ width: 32, height: 32, fontSize: 14 }}>{params.row.displayName.slice(0, 1).toUpperCase()}</Avatar>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{params.row.displayName}</Typography>
        </Box>
      ),
    },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 220 },
    {
      field: 'role',
      headerName: 'Role',
      minWidth: 150,
      renderCell: params => canChangeRole ? (
        <TextField select size="small" value={params.row.role} onChange={event => onChangeRole(params.row, event.target.value as EmployeeRole)} sx={{ width: 125 }}>
          {EMPLOYEE_ROLES.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
        </TextField>
      ) : <Chip size="small" label={params.row.role} />,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      minWidth: 115,
      renderCell: params => <Chip size="small" label={params.row.isActive ? 'Active' : 'Disabled'} color={params.row.isActive ? 'success' : 'default'} />,
    },
    { field: 'createdAt', headerName: 'Joined', minWidth: 150, valueFormatter: value => formatDate(String(value)) },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      minWidth: 120,
      renderCell: params => canUpdate ? (
        <Button size="small" color={params.row.isActive ? 'error' : 'primary'} onClick={() => onToggleStatus(params.row)}>
          {params.row.isActive ? 'Disable' : 'Enable'}
        </Button>
      ) : null,
    },
  ];

  return (
    <Box sx={{ height: 520, width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
      <DataGrid rows={employees} columns={columns} loading={loading} hideFooter disableRowSelectionOnClick sx={{ border: 1, borderColor: 'divider' }} />
    </Box>
  );
}
