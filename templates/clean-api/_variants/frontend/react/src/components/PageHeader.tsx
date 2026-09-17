import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, eyebrow, actions }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { sm: 'flex-start' }, justifyContent: 'space-between', mb: 3 }}>
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: '.08em' }}>
            {eyebrow}
          </Typography>
        )}
        <Typography component="h1" variant="h4" sx={{ fontWeight: 800, letterSpacing: '-.025em' }}>
          {title}
        </Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: .75, maxWidth: 760 }}>
            {description}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
    </Box>
  );
}
