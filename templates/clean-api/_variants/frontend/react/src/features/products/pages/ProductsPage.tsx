import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button, MenuItem, Pagination, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { AuthUser } from '../../../core/auth/auth-session';
import { can } from '../../../core/auth/auth-session';
import { type BusinessListQuery, type ListFilter } from '../../business/business-query';
import { AsyncState } from '../../../shared/components/AsyncState';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { PageHeader } from '../../../shared/components/PageHeader';
import { useNotifications } from '../../../shared/feedback/NotificationProvider';
import { getErrorMessage } from '../../../shared/utils/http-error';
import { productsApi } from '../api/products.api';
import { ProductFilters } from '../components/ProductFilters';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { ProductsGrid } from '../components/ProductsGrid';
import type { Product, ProductFilterState, ProductModel } from '../product.models';

type Props = { user: AuthUser };

const initialFilters: ProductFilterState = { keyword: '', sort: '', active: '', lowStock: '' };
const initialQuery: BusinessListQuery = { page: 1, pageSize: 20 };
const pageSizes = [10, 20, 50, 100];

export function ProductsPage({ user }: Props) {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const [query, setQuery] = useState<BusinessListQuery>(initialQuery);
  const [filters, setFilters] = useState<ProductFilterState>(initialFilters);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const products = useQuery({
    queryKey: ['products', query],
    queryFn: () => productsApi.list(query),
  });

  const save = useMutation({
    mutationFn: ({ product, model }: { product: Product | null; model: ProductModel }) => product
      ? productsApi.update(product.id, model)
      : productsApi.create(model),
    onSuccess: async (_, variables) => {
      notifications.success(variables.product ? 'Product updated.' : 'Product created.');
      setFormOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: error => notifications.error(getErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (product: Product) => productsApi.remove(product.id),
    onSuccess: async () => {
      notifications.success('Product deleted.');
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: error => notifications.error(getErrorMessage(error)),
  });

  const applyFilters = () => {
    const nextFilters: ListFilter[] = [];
    if (filters.active) nextFilters.push({ field: 'IsActive', operator: '$eq', value: filters.active === 'true' });
    if (filters.lowStock.trim()) nextFilters.push({ field: 'StockQuantity', operator: '$lte', value: Math.max(0, Number(filters.lowStock)) });
    setQuery(current => ({
      ...current,
      page: 1,
      keyword: filters.keyword.trim() || undefined,
      targets: ['Name', 'Sku'],
      sort: filters.sort || undefined,
      filters: nextFilters,
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setQuery(current => ({ page: 1, pageSize: current.pageSize }));
  };

  const page = products.data;
  const currentPage = page?.paging?.currentPage ?? query.page;
  const totalPages = page?.paging?.totalPage ?? 0;

  return (
    <Box component="section">
      <PageHeader
        eyebrow="Sales"
        title="Products"
        description="Catalog, pricing and stock at a glance."
        actions={(
          <>
            <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={() => void products.refetch()} disabled={products.isFetching}>Refresh</Button>
            {can(user, 'products.create') && <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>Add product</Button>}
          </>
        )}
      />

      <ProductFilters value={filters} onChange={setFilters} onApply={applyFilters} onClear={clearFilters} />

      <AsyncState
        loading={products.isLoading}
        error={products.isError ? getErrorMessage(products.error) : null}
        empty={!products.isLoading && !products.isError && (page?.data.length ?? 0) === 0}
        emptyTitle="No products yet"
        emptyMessage="Create your first product or adjust the current filters."
        onRetry={() => void products.refetch()}
      />

      {page && page.data.length > 0 && (
        <>
          <ProductsGrid
            products={page.data}
            loading={products.isFetching}
            canUpdate={can(user, 'products.update')}
            canDelete={can(user, 'products.delete')}
            onEdit={product => { setEditing(product); setFormOpen(true); }}
            onDelete={setDeleteTarget}
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

      <ProductFormDialog
        open={formOpen}
        product={editing}
        busy={save.isPending}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={model => save.mutate({ product: editing, model })}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete product?"
        description={deleteTarget ? `Delete ${deleteTarget.name}? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        busy={remove.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) remove.mutate(deleteTarget); }}
      />
    </Box>
  );
}
