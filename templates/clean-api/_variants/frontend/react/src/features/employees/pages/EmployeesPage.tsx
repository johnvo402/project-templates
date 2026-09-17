import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button, MenuItem, Pagination, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { AuthUser } from '../../../core/auth/auth-session';
import { can } from '../../../core/auth/auth-session';
import { AsyncState } from '../../../shared/components/AsyncState';
import { PageHeader } from '../../../shared/components/PageHeader';
import { useNotifications } from '../../../shared/feedback/NotificationProvider';
import { getErrorMessage } from '../../../shared/utils/http-error';
import { type BusinessListQuery, type ListFilter } from '../../../shared/query/business-query';
import { employeesApi } from '../api/employees.api';
import { EmployeeFilters } from '../components/EmployeeFilters';
import { EmployeeFormDialog } from '../components/EmployeeFormDialog';
import { EmployeesGrid } from '../components/EmployeesGrid';
import type { CreateEmployeeModel, Employee, EmployeeFilterState, EmployeeRole } from '../employee.models';

type Props = { user: AuthUser };

const initialFilters: EmployeeFilterState = { keyword: '', sort: '', role: '', status: '' };
const initialQuery: BusinessListQuery = { page: 1, pageSize: 20 };
const pageSizes = [10, 20, 50, 100];

export function EmployeesPage({ user }: Props) {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const [query, setQuery] = useState<BusinessListQuery>(initialQuery);
  const [filters, setFilters] = useState<EmployeeFilterState>(initialFilters);
  const [formOpen, setFormOpen] = useState(false);

  const employees = useQuery({
    queryKey: ['employees', query],
    queryFn: () => employeesApi.list(query),
  });

  const createEmployee = useMutation({
    mutationFn: (model: CreateEmployeeModel) => employeesApi.create(model),
    onSuccess: async () => {
      notifications.success('Employee created.');
      setFormOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: error => notifications.error(getErrorMessage(error)),
  });

  const changeRole = useMutation({
    mutationFn: ({ employee, role }: { employee: Employee; role: EmployeeRole }) => employeesApi.changeRole(employee.id, role),
    onSuccess: async (_, variables) => {
      notifications.success(`${variables.employee.displayName}'s role updated.`);
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: error => notifications.error(getErrorMessage(error)),
  });

  const toggleStatus = useMutation({
    mutationFn: (employee: Employee) => employeesApi.setStatus(employee.id, !employee.isActive),
    onSuccess: async (_, employee) => {
      notifications.success(`${employee.displayName} ${employee.isActive ? 'disabled' : 'enabled'}.`);
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: error => notifications.error(getErrorMessage(error)),
  });

  const applyFilters = () => {
    const lhs: ListFilter[] = [];
    if (filters.role) lhs.push({ field: 'Role', operator: '$eqi', value: filters.role });
    if (filters.status) lhs.push({ field: 'IsActive', operator: '$eq', value: filters.status === 'true' });
    setQuery(current => ({
      ...current,
      page: 1,
      keyword: filters.keyword.trim() || undefined,
      targets: ['DisplayName', 'Email', 'Role'],
      sort: filters.sort || undefined,
      filters: lhs,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setQuery(current => ({ page: 1, pageSize: current.pageSize }));
  };

  const page = employees.data;
  const currentPage = page?.paging?.currentPage ?? query.page;
  const totalPages = page?.paging?.totalPage ?? 0;

  return (
    <Box component="section">
      <PageHeader
        eyebrow="Management"
        title="Employees"
        description="Team access, roles and account status."
        actions={(
          <>
            <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => void employees.refetch()} disabled={employees.isFetching}>Refresh</Button>
            {can(user, 'employees.create') && <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setFormOpen(true)}>Add employee</Button>}
          </>
        )}
      />

      <EmployeeFilters value={filters} onChange={setFilters} onApply={applyFilters} onClear={clearFilters} />

      <AsyncState
        loading={employees.isLoading}
        error={employees.isError ? getErrorMessage(employees.error) : null}
        empty={!employees.isLoading && !employees.isError && (page?.data.length ?? 0) === 0}
        emptyTitle="No employees yet"
        emptyMessage="Add your first employee or adjust the current filters."
        onRetry={() => void employees.refetch()}
      />

      {page && page.data.length > 0 && (
        <>
          <EmployeesGrid
            employees={page.data}
            loading={employees.isFetching || changeRole.isPending || toggleStatus.isPending}
            canUpdate={can(user, 'employees.update')}
            canChangeRole={can(user, 'employees.change-role')}
            onChangeRole={(employee, role) => { if (role !== employee.role) changeRole.mutate({ employee, role }); }}
            onToggleStatus={employee => toggleStatus.mutate(employee)}
          />
          {page.paging && (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mt: 2 }}>
              <Typography variant="body2" color="text.secondary">{totalPages ? `Page ${currentPage} of ${totalPages}` : 'No results'}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <TextField select size="small" label="Rows" value={query.pageSize} onChange={event => setQuery(current => ({ ...current, page: 1, pageSize: Number(event.target.value) }))} sx={{ width: 100 }}>
                  {pageSizes.map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
                </TextField>
                <Pagination count={Math.max(1, totalPages)} page={Math.max(1, currentPage)} onChange={(_, nextPage) => setQuery(current => ({ ...current, page: nextPage }))} disabled={totalPages <= 1} />
              </Box>
            </Box>
          )}
        </>
      )}

      <EmployeeFormDialog open={formOpen} busy={createEmployee.isPending} onClose={() => setFormOpen(false)} onSubmit={model => createEmployee.mutate(model)} />
    </Box>
  );
}
