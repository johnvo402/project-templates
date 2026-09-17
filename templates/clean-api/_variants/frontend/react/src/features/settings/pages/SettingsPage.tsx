import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { can, type AuthUser } from '../../../core/auth/auth-session';
import { AsyncState } from '../../../components/AsyncState';
import { PageHeader } from '../../../components/PageHeader';
import { useNotifications } from '../../../feedback/NotificationProvider';
import { getErrorMessage } from '../../../utils/http-error';
import { settingsApi } from '../api/settings.api';
import type { StoreSettings } from '../settings.models';

export function SettingsPage({ user }: { user: AuthUser }) {
  const queryClient = useQueryClient();
  const notifications = useNotifications();
  const settings = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get });
  const [draft, setDraft] = useState<StoreSettings | null>(null);
  const canUpdate = can(user, 'settings.update');
  useEffect(() => { if (settings.data) setDraft(settings.data); }, [settings.data]);
  const update = useMutation({ mutationFn: settingsApi.update, onSuccess: async saved => { setDraft(saved); notifications.success('Settings saved.'); await queryClient.invalidateQueries({ queryKey: ['settings'] }); }, onError: error => notifications.error(getErrorMessage(error)) });
  const set = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => setDraft(current => current ? { ...current, [key]: value } : current);

  return <Box component="section"><PageHeader eyebrow="System" title="Settings" description="Store identity and operational defaults." actions={canUpdate && draft ? <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={() => update.mutate(draft)} disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save settings'}</Button> : undefined} /><AsyncState loading={settings.isLoading} error={settings.isError ? getErrorMessage(settings.error) : null} onRetry={() => void settings.refetch()} />{draft && <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Store defaults</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,minmax(0,1fr))' }, gap: 2 }}><TextField label="Store name" value={draft.storeName} disabled={!canUpdate} onChange={e => set('storeName', e.target.value)} /><TextField label="Email" type="email" value={draft.storeEmail} disabled={!canUpdate} onChange={e => set('storeEmail', e.target.value)} /><TextField label="Phone" value={draft.storePhone} disabled={!canUpdate} onChange={e => set('storePhone', e.target.value)} /><TextField label="Currency" value={draft.currency} disabled={!canUpdate} slotProps={{ htmlInput: { maxLength: 3 } }} onChange={e => set('currency', e.target.value.toUpperCase())} /><TextField label="Timezone" value={draft.timezone} disabled={!canUpdate} onChange={e => set('timezone', e.target.value)} /><TextField label="Low-stock threshold" type="number" value={draft.lowStockThreshold} disabled={!canUpdate} slotProps={{ htmlInput: { min: 0 } }} onChange={e => set('lowStockThreshold', Math.max(0, Number(e.target.value)))} /></Box>{!canUpdate && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>You have read-only access to store settings.</Typography>}</Paper>}</Box>;
}
