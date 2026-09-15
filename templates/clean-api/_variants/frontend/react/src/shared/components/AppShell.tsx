import type { ReactNode } from 'react';
import type { AuthUser } from '../../core/auth/auth-session';

type Props = { user: AuthUser; onLogout: () => void; children: ReactNode };

export function AppShell({ user, onLogout, children }: Props) {
  const initials = user.displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'U';
  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark small">JV</div><div><strong>TemplateApp</strong><span>Developer workspace</span></div></div>
      <div className="account"><div className="avatar-fallback">{initials}</div><div className="account-copy"><strong>{user.displayName}</strong><span>{user.email} · {user.role}</span></div><button className="ghost" onClick={onLogout}>Sign out</button></div>
    </header>
    <section className="welcome"><div><p className="eyebrow">Dashboard</p><h1>Good to see you, {user.displayName}.</h1><p>These starter features are wired end-to-end and intended to be replaced by your product domains.</p></div><span className="role-badge">{user.role}</span></section>
    <div className="grid">{children}</div>
  </main>;
}
