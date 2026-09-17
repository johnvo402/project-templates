import { Alert, Snackbar } from '@mui/material';
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

type NotificationApi = {
  notify: (message: string, severity?: NotificationSeverity) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

type NotificationState = {
  id: number;
  message: string;
  severity: NotificationSeverity;
};

const NotificationContext = createContext<NotificationApi | null>(null);

export function NotificationProvider({ children }: PropsWithChildren) {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const notify = useCallback((message: string, severity: NotificationSeverity = 'info') => {
    setNotification({ id: Date.now(), message, severity });
  }, []);

  const value = useMemo<NotificationApi>(() => ({
    notify,
    success: message => notify(message, 'success'),
    error: message => notify(message, 'error'),
  }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {notification && (
        <Snackbar
          key={notification.id}
          open
          autoHideDuration={4_000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={() => setNotification(null)}
        >
          <Alert severity={notification.severity} variant="filled" onClose={() => setNotification(null)}>
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider.');
  return context;
}
