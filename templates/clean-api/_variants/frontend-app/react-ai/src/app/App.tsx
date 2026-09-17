import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useEffect, useState } from 'react';
import { bootstrapAuth, logout, type AuthUser } from '../core/auth/auth-session';
import { AiPanel } from '../features/ai/AiPanel';
import { LoginPage } from '../features/auth/LoginPage';
import { AuthenticatedApp, type AppRouteExtension } from './AuthenticatedApp';

export function App() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  useEffect(() => { void bootstrapAuth().then(setUser); }, []);
  if (user === undefined) return <main className="shell"><p>Restoring session…</p></main>;
  if (user === null) return <LoginPage onAuthenticated={setUser} />;

  const extensions: readonly AppRouteExtension[] = [{
    navigation: {
      label: 'AI Assistant',
      path: '/ai',
      group: 'Account',
      permission: 'ai.generate',
      icon: <AutoAwesomeOutlinedIcon />,
    },
    element: <AiPanel />,
  }];

  return <AuthenticatedApp user={user} onLogout={() => void logout().finally(() => setUser(null))} onProfileUpdated={displayName => setUser(current => current ? { ...current, displayName } : current)} extensions={extensions} />;
}
