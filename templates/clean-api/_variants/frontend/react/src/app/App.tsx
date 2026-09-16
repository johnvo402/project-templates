import { useEffect, useState } from 'react';
import { bootstrapAuth, logout, type AuthUser } from '../core/auth/auth-session';
import { LoginPage } from '../features/auth/LoginPage';
import { BusinessWorkspace } from '../features/business/BusinessWorkspace';
import { AppShell } from '../shared/components/AppShell';

export function App() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  useEffect(() => { void bootstrapAuth().then(setUser); }, []);
  if (user === undefined) return <main className="shell"><p>Restoring session…</p></main>;
  if (user === null) return <LoginPage onAuthenticated={setUser} />;
  return <AppShell user={user} onLogout={() => void logout().finally(() => setUser(null))}>
    <BusinessWorkspace
      user={user}
      onProfileUpdated={displayName => setUser(current => current ? { ...current, displayName } : current)}
    />
  </AppShell>;
}
