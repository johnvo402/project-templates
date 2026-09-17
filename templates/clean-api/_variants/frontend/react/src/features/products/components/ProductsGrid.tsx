import { Box, Button, Chip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import type { Product } from '../product.models';

type Props = {
  products: Product[];
  loading: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductsGrid({ products, loading, canUpdate, canDelete, onEdit, onDelete }: Props) {
  const columns: GridColDef<Product>[] = [
    { field: 'name', headerName: 'Product', flex: 1.5, minWidth: 180 },
    { field: 'sku', headerName: 'SKU', flex: 1, minWidth: 120 },
    { field: 'price', headerName: 'Price', minWidth: 130, valueFormatter: value => formatCurrency(Number(value ?? 0)) },
    { field: 'stockQuantity', headerName: 'Stock', minWidth: 100, type: 'number' },
    {
      field: 'isActive',
      headerName: 'Status',
      minWidth: 110,
      renderCell: params => <Chip size="small" label={params.row.isActive ? 'Active' : 'Inactive'} color={params.row.isActive ? 'success' : 'default'} />,
    },
    { field: 'updatedAt', headerName: 'Updated', minWidth: 150, valueFormatter: value => formatDate(String(value)) },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      minWidth: 170,
      renderCell: params => (
        <Box sx={{ display: 'flex', gap: .5 }}>
          {canUpdate && <Button size="small" onClick={() => onEdit(params.row)}>Edit</Button>}
          {canDelete && <Button size="small" color="error" onClick={() => onDelete(params.row)}>Delete</Button>}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 520, width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
      <DataGrid
        rows={products}
        columns={columns}
        loading={loading}
        hideFooter
        disableRowSelectionOnClick
        sx={{ border: 1, borderColor: 'divider' }}
      />
    </Box>
  );
}
