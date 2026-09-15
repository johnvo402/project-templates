import { useEffect, useState } from 'react';
import { bootstrapAuth, can, logout, type AuthUser } from '../core/auth/auth-session';
import { LoginPage } from '../features/auth/LoginPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { TodoPage } from '../features/todos/TodoPage';
import { UsersPage } from '../features/users/UsersPage';
import { AiPanel } from '../features/ai/AiPanel';
import { AppShell } from '../shared/components/AppShell';

export function App() {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  useEffect(() => { void bootstrapAuth().then(setUser); }, []);
  if (user === undefined) return <main className="shell"><p>Restoring session…</p></main>;
  if (user === null) return <LoginPage onAuthenticated={setUser} />;
  return <AppShell user={user} onLogout={() => void logout().finally(() => setUser(null))}>
    <ProfilePage user={user} onProfileUpdated={displayName => setUser(current => current ? { ...current, displayName } : current)} />
    {can(user, 'users.read') && <UsersPage canManage={can(user, 'users.manage')} />}
    {can(user, 'todos.read') && <TodoPage canWrite={can(user, 'todos.write')} />}
    {can(user, 'ai.generate') && <AiPanel />}
  </AppShell>;
}
