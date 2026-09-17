import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../../../utils/formatters';
import type { CreateOrderModel, OrderItemModel, ProductOption } from '../order.models';

type Props = {
  open: boolean;
  products: ProductOption[];
  productsLoading: boolean;
  productsError?: string | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (model: CreateOrderModel) => void;
};

const emptyItem = (): OrderItemModel => ({ productId: '', quantity: 1 });
const emptyModel = (): CreateOrderModel => ({ customerName: '', customerPhone: null, items: [emptyItem()] });

export function OrderFormDialog({ open, products, productsLoading, productsError, busy, onClose, onSubmit }: Props) {
  const [model, setModel] = useState<CreateOrderModel>(emptyModel);

  useEffect(() => {
    if (open) setModel(emptyModel());
  }, [open]);

  const setItem = (index: number, patch: Partial<OrderItemModel>) => {
    setModel(current => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) }));
  };
  const addItem = () => setModel(current => ({ ...current, items: [...current.items, emptyItem()] }));
  const removeItem = (index: number) => setModel(current => current.items.length === 1 ? current : ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }));
  const hasItem = model.items.some(item => item.productId && item.quantity > 0);
  const submit = () => onSubmit({
    customerName: model.customerName.trim(),
    customerPhone: model.customerPhone?.trim() || null,
    items: model.items.filter(item => item.productId).map(item => ({ productId: item.productId, quantity: Math.max(1, Number(item.quantity)) })),
  });

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>New order</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {productsError && <Alert severity="error">{productsError}</Alert>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField label="Customer name" value={model.customerName} onChange={event => setModel(current => ({ ...current, customerName: event.target.value }))} autoFocus />
            <TextField label="Phone" value={model.customerPhone ?? ''} onChange={event => setModel(current => ({ ...current, customerPhone: event.target.value }))} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Items</Typography>
              <Button startIcon={<AddOutlinedIcon />} onClick={addItem}>Add item</Button>
            </Box>
            <Stack spacing={1.5}>
              {model.items.map((item, index) => (
                <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0,1fr) 120px auto' }, gap: 1, alignItems: 'center' }}>
                  <TextField select label="Product" value={item.productId} onChange={event => setItem(index, { productId: event.target.value })} disabled={productsLoading || Boolean(productsError)}>
                    <MenuItem value="">Select product</MenuItem>
                    {products.map(product => <MenuItem key={product.id} value={product.id}>{product.name} · {formatCurrency(product.price)} · {product.stockQuantity} in stock</MenuItem>)}
                  </TextField>
                  <TextField label="Quantity" type="number" value={item.quantity} onChange={event => setItem(index, { quantity: Math.max(1, Number(event.target.value)) })} slotProps={{ htmlInput: { min: 1 } }} />
                  <Button type="button" size="small" color="error" onClick={() => removeItem(index)} disabled={model.items.length === 1}>Remove</Button>
                </Box>
              ))}
            </Stack>
            {productsLoading && <Typography variant="caption" color="text.secondary">Loading active products…</Typography>}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={busy || productsLoading || Boolean(productsError) || !model.customerName.trim() || !hasItem}>{busy ? 'Creating…' : 'Create order'}</Button>
      </DialogActions>
    </Dialog>
  );
}
