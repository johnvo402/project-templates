import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { EMPLOYEE_ROLES, type CreateEmployeeModel, type EmployeeRole } from '../employee.models';

type Props = {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (model: CreateEmployeeModel) => void;
};

const emptyEmployee = (): CreateEmployeeModel => ({
  email: '',
  password: '',
  displayName: '',
  role: 'Staff',
});

export function EmployeeFormDialog({ open, busy, onClose, onSubmit }: Props) {
  const [model, setModel] = useState<CreateEmployeeModel>(emptyEmployee);

  useEffect(() => {
    if (open) setModel(emptyEmployee());
  }, [open]);

  const valid = Boolean(model.displayName.trim() && model.email.trim() && model.password);

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add employee</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '12px !important' }}>
        <TextField autoFocus label="Display name" value={model.displayName} onChange={event => setModel(current => ({ ...current, displayName: event.target.value }))} required />
        <TextField label="Email" type="email" value={model.email} onChange={event => setModel(current => ({ ...current, email: event.target.value }))} required />
        <TextField label="Temporary password" type="password" autoComplete="new-password" value={model.password} onChange={event => setModel(current => ({ ...current, password: event.target.value }))} required />
        <TextField select label="Role" value={model.role} onChange={event => setModel(current => ({ ...current, role: event.target.value as EmployeeRole }))}>
          {EMPLOYEE_ROLES.map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" disabled={busy || !valid} onClick={() => onSubmit({ ...model, displayName: model.displayName.trim(), email: model.email.trim() })}>
          {busy ? 'Creating…' : 'Create employee'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
