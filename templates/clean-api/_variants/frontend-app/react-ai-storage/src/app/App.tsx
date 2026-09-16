import { useEffect, useState } from 'react';
import { bootstrapAuth, can, logout, type AuthUser } from '../core/auth/auth-session';
import { LoginPage } from '../features/auth/LoginPage';
import { AiPanel } from '../features/ai/AiPanel';
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
      aiPanel={can(user, 'ai.generate') ? <AiPanel /> : undefined}
    />
  </AppShell>;
}
