import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { emptyProductModel, type Product, type ProductModel } from '../product.models';

type Props = {
  open: boolean;
  product: Product | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (model: ProductModel) => void;
};

export function ProductFormDialog({ open, product, busy, onClose, onSubmit }: Props) {
  const [model, setModel] = useState<ProductModel>(emptyProductModel);

  useEffect(() => {
    setModel(product ? {
      name: product.name,
      sku: product.sku,
      price: product.price,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
    } : emptyProductModel);
  }, [open, product]);

  const valid = model.name.trim().length > 0 && model.sku.trim().length > 0 && model.price >= 0 && model.stockQuantity >= 0;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Edit product' : 'New product'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 1 }}>
          <TextField label="Name" value={model.name} onChange={event => setModel({ ...model, name: event.target.value })} autoFocus />
          <TextField label="SKU" value={model.sku} onChange={event => setModel({ ...model, sku: event.target.value.toUpperCase() })} />
          <TextField label="Price" type="number" value={model.price} onChange={event => setModel({ ...model, price: Number(event.target.value) })} />
          <TextField label="Stock quantity" type="number" value={model.stockQuantity} onChange={event => setModel({ ...model, stockQuantity: Number(event.target.value) })} />
          <FormControlLabel control={<Switch checked={model.isActive} onChange={event => setModel({ ...model, isActive: event.target.checked })} />} label="Active" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" disabled={busy || !valid} onClick={() => onSubmit({ ...model, name: model.name.trim(), sku: model.sku.trim() })}>
          {busy ? 'Saving…' : product ? 'Save changes' : 'Create product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
