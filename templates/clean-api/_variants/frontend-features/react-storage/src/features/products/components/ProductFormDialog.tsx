import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { emptyProductModel, type Product, type ProductModel } from '../product.models';

const maxImageBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

type Props = {
  open: boolean;
  product: Product | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (model: ProductModel, image: File | null) => void;
};

export function ProductFormDialog({ open, product, busy, onClose, onSubmit }: Props) {
  const [model, setModel] = useState<ProductModel>(emptyProductModel);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    setModel(product ? {
      name: product.name,
      sku: product.sku,
      price: product.price,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
    } : emptyProductModel);
    setImage(null);
    setImageError('');
  }, [open, product]);

  const selectImage = (file: File | null) => {
    if (!file) {
      setImage(null);
      setImageError('');
      return;
    }
    if (!allowedImageTypes.has(file.type)) {
      setImage(null);
      setImageError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > maxImageBytes) {
      setImage(null);
      setImageError('Product image must be 5 MB or smaller.');
      return;
    }
    setImage(file);
    setImageError('');
  };

  const valid = model.name.trim().length > 0 && model.sku.trim().length > 0 && model.price >= 0 && model.stockQuantity >= 0 && !imageError;

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
          <Box sx={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.75 }}>
            <Button component="label" variant="outlined" disabled={busy}>
              {image ? 'Change image' : 'Choose image'}
              <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event => selectImage(event.target.files?.[0] ?? null)} />
            </Button>
            <Box component="small" sx={{ color: imageError ? 'error.main' : 'text.secondary' }}>
              {imageError || image?.name || (product ? 'Leave empty to keep the current image.' : 'Optional. JPEG, PNG, or WebP up to 5 MB.')}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" disabled={busy || !valid} onClick={() => onSubmit({ ...model, name: model.name.trim(), sku: model.sku.trim() }, image)}>
          {busy ? 'Saving…' : product ? 'Save changes' : 'Create product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
