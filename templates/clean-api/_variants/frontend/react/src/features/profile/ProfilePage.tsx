import { FormEvent, useEffect, useState } from 'react';
import type { AuthUser } from '../../core/auth/auth-session';
import { profileApi } from './profile.api';

type Props = { user: AuthUser; onProfileUpdated: (displayName: string) => void };

export function ProfilePage({ user, onProfileUpdated }: Props) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => { void profileApi.get().then(profile => { setDisplayName(profile.displayName); setBio(profile.bio ?? ''); }).finally(() => setLoading(false)); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setNotice('');
    try { await profileApi.update(displayName, bio); onProfileUpdated(displayName.trim()); setNotice('Profile updated.'); }
    catch { setNotice('Could not update profile.'); }
    finally { setSaving(false); }
  }

  return <section className="card profile-card">
    <div className="section-heading"><div><p className="eyebrow">Account</p><h2>Profile</h2></div><span className="status-dot">Active</span></div>
    {loading ? <p className="muted">Loading profile…</p> : <form className="stack" onSubmit={submit}>
      <label>Display name<input maxLength={120} value={displayName} onChange={e => setDisplayName(e.target.value)} /></label>
      <label>Email<input value={user.email} disabled /></label>
      <label>Bio<textarea rows={4} maxLength={500} placeholder="A short introduction…" value={bio} onChange={e => setBio(e.target.value)} /></label>
      <div className="form-footer"><span className="hint">{bio.length}/500</span><button className="primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button></div>
      {notice && <p className="notice">{notice}</p>}
    </form>}
  </section>;
}
