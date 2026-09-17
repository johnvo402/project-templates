import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router';
import { NotificationProvider } from '../shared/feedback/NotificationProvider';
import { appTheme } from './theme';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30_000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={appTheme} defaultMode="system">
        <CssBaseline />
        <BrowserRouter>
          <NotificationProvider>{children}</NotificationProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
