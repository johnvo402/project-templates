import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';

type AsyncStateProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  onRetry?: () => void;
};

export function AsyncState({
  loading = false,
  error,
  empty = false,
  loadingLabel = 'Loading…',
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'There is no data to display.',
  onRetry,
}: AsyncStateProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'center', py: 6 }} role="status">
        <CircularProgress size={24} />
        <Typography color="text.secondary">{loadingLabel}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={onRetry ? <Button color="inherit" size="small" onClick={onRetry}>Retry</Button> : undefined}
      >
        {error}
      </Alert>
    );
  }

  if (empty) {
    return (
      <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
        <Box sx={{ maxWidth: 520, mx: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 750 }}>{emptyTitle}</Typography>
          <Typography color="text.secondary" sx={{ mt: .75 }}>{emptyMessage}</Typography>
        </Box>
      </Paper>
    );
  }

  return null;
}
