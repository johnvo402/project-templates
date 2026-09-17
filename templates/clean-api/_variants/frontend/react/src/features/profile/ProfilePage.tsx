import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type { AuthUser } from '../../core/auth/auth-session';
import { AsyncState } from '../../shared/components/AsyncState';
import { PageHeader } from '../../shared/components/PageHeader';
import { useNotifications } from '../../shared/feedback/NotificationProvider';
import { getErrorMessage } from '../../shared/utils/http-error';
import { profileApi } from './profile.api';

type Props = { user: AuthUser; onProfileUpdated: (displayName: string) => void };

export function ProfilePage({ user, onProfileUpdated }: Props) {
  const notifications = useNotifications();
  const profile = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState('');
  useEffect(() => { if (profile.data) { setDisplayName(profile.data.displayName); setBio(profile.data.bio ?? ''); } }, [profile.data]);
  const update = useMutation({ mutationFn: () => profileApi.update(displayName.trim(), bio), onSuccess: () => { onProfileUpdated(displayName.trim()); notifications.success('Profile updated.'); }, onError: error => notifications.error(getErrorMessage(error)) });

  return <Box component="section"><PageHeader eyebrow="Account" title="Profile" description="Keep your public display name and short bio up to date." actions={<Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={() => update.mutate()} disabled={update.isPending || !displayName.trim()}>{update.isPending ? 'Saving…' : 'Save profile'}</Button>} /><AsyncState loading={profile.isLoading} error={profile.isError ? getErrorMessage(profile.error) : null} onRetry={() => void profile.refetch()} />{profile.data && <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, maxWidth: 760 }}><Box sx={{ display: 'grid', gap: 2 }}><TextField label="Display name" value={displayName} slotProps={{ htmlInput: { maxLength: 120 } }} onChange={e => setDisplayName(e.target.value)} /><TextField label="Email" value={profile.data.email || user.email} disabled /><TextField label="Bio" multiline minRows={4} value={bio} slotProps={{ htmlInput: { maxLength: 500 } }} helperText={`${bio.length}/500`} onChange={e => setBio(e.target.value)} /><Typography variant="body2" color="text.secondary">Role: {profile.data.role}</Typography></Box></Paper>}</Box>;
}
