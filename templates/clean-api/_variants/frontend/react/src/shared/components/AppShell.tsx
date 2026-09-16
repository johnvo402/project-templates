import type { ReactNode } from 'react';
import type { AuthUser } from '../../core/auth/auth-session';

type Props = { user: AuthUser; onLogout: () => void; children: ReactNode };

export function AppShell({ user, onLogout, children }: Props) {
  const initials = user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'U';
  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark small">JV</div><div><strong>TemplateApp</strong><span>Mini Store Admin</span></div></div>
      <div className="account"><div className="avatar-fallback">{initials}</div><div className="account-copy"><strong>{user.displayName}</strong><span>{user.email} · {user.role}</span></div><button className="ghost" onClick={onLogout}>Sign out</button></div>
    </header>
    {children}
  </main>;
}
