import { useEffect, useState } from 'react';
import { bootstrapAuth, logout, type AuthUser } from '../core/auth/auth-session';
import { LoginPage } from '../features/auth/LoginPage';
import { AuthenticatedApp } from './AuthenticatedApp';

export function App() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  useEffect(() => { void bootstrapAuth().then(setUser); }, []);
  if (user === undefined) return <main className="shell"><p>Restoring session…</p></main>;
  if (user === null) return <LoginPage onAuthenticated={setUser} />;
  return <AuthenticatedApp
    user={user}
    onLogout={() => void logout().finally(() => setUser(null))}
    onProfileUpdated={displayName => setUser(current => current ? { ...current, displayName } : current)}
  />;
}
