import { FormEvent, useState } from 'react';
import { login, register, type AuthUser } from '../../core/auth/auth-session';

type Props = { onAuthenticated: (user: AuthUser) => void };

export function LoginPage({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('Admin');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError('');
    try {
      const user = mode === 'login'
        ? await login(email, password)
        : await register(email, password, displayName);
      onAuthenticated(user);
    } catch (value) {
      setError(value instanceof Error ? value.message : 'Authentication failed.');
    } finally { setLoading(false); }
  }

  return <main className="auth-layout">
    <section className="auth-hero">
      <div className="brand-mark">JV</div>
      <p className="eyebrow">JohnVo starter</p>
      <h1>Build the product, not the boilerplate.</h1>
      <p>DDD backend, secure in-memory access tokens, feature-based frontend, paging, validation and production Docker defaults.</p>
      <div className="hero-points"><span>Clean Architecture</span><span>Vertical Slice</span><span>Permission policies</span></div>
    </section>
    <section className="auth-card">
      <div className="segmented">
        <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>Sign in</button>
        <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>Create account</button>
      </div>
      <div><p className="eyebrow">Welcome</p><h2>{mode === 'login' ? 'Sign in to your workspace' : 'Create the first account'}</h2></div>
      <form className="stack" onSubmit={submit}>
        {mode === 'register' && <label>Display name<input autoComplete="name" value={displayName} onChange={e => setDisplayName(e.target.value)} /></label>}
        <label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} /></label>
        {mode === 'register' && <p className="hint">The first registered account is bootstrapped as Admin.</p>}
        {error && <p className="error surface-error">{error}</p>}
        <button className="primary large" disabled={loading}>{loading ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
    </section>
  </main>;
}
