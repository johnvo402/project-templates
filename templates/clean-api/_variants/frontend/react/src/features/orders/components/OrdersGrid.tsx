import { Box, Button, Chip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import type { MutableOrderStatus, Order, OrderStatus } from '../order.models';

type Props = {
  orders: Order[];
  loading: boolean;
  busy: boolean;
  canUpdate: boolean;
  canCancel: boolean;
  onView: (order: Order) => void;
  onUpdateStatus: (order: Order, status: MutableOrderStatus) => void;
  onCancel: (order: Order) => void;
};

function statusColor(status: OrderStatus): 'default' | 'info' | 'success' | 'warning' | 'error' {
  if (status === 'Processing') return 'info';
  if (status === 'Completed') return 'success';
  if (status === 'Cancelled') return 'error';
  return 'warning';
}

export function OrdersGrid({ orders, loading, busy, canUpdate, canCancel, onView, onUpdateStatus, onCancel }: Props) {
  const columns: GridColDef<Order>[] = [
    { field: 'orderNumber', headerName: 'Order', minWidth: 140 },
    { field: 'customerName', headerName: 'Customer', flex: 1.3, minWidth: 180 },
    { field: 'status', headerName: 'Status', minWidth: 130, renderCell: params => <Chip size="small" label={params.row.status} color={statusColor(params.row.status)} /> },
    { field: 'itemCount', headerName: 'Items', minWidth: 90 },
    { field: 'totalAmount', headerName: 'Total', minWidth: 130, valueFormatter: value => formatCurrency(Number(value ?? 0)) },
    { field: 'createdAt', headerName: 'Created', minWidth: 150, valueFormatter: value => formatDate(String(value)) },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      minWidth: 300,
      renderCell: params => {
        const order = params.row;
        return (
          <Box sx={{ display: 'flex', gap: .5, flexWrap: 'wrap' }}>
            <Button size="small" onClick={() => onView(order)}>View</Button>
            {canUpdate && order.status === 'Pending' && <Button size="small" disabled={busy} onClick={() => onUpdateStatus(order, 'Processing')}>Process</Button>}
            {canUpdate && order.status === 'Processing' && <Button size="small" disabled={busy} onClick={() => onUpdateStatus(order, 'Completed')}>Complete</Button>}
            {canCancel && order.status !== 'Completed' && order.status !== 'Cancelled' && <Button size="small" color="error" disabled={busy} onClick={() => onCancel(order)}>Cancel</Button>}
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ height: 520, width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
      <DataGrid rows={orders} columns={columns} loading={loading} hideFooter disableRowSelectionOnClick sx={{ border: 1, borderColor: 'divider' }} />
    </Box>
  );
}
