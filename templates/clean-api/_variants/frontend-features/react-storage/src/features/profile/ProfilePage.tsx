import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import type { AuthUser } from '../../core/auth/auth-session';
import { avatarApi } from './avatar.api';
import { profileApi } from './profile.api';

type Props = { user: AuthUser; onProfileUpdated: (displayName: string) => void };

export function ProfilePage({ user, onProfileUpdated }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    void Promise.all([profileApi.get(), avatarApi.get()]).then(([profile, avatar]) => {
      setDisplayName(profile.displayName); setBio(profile.bio ?? ''); setAvatarUrl(avatar);
    }).finally(() => setLoading(false));
  }, []);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    setUploading(true); setNotice('');
    try { setAvatarUrl(await avatarApi.upload(file)); setNotice('Avatar updated.'); }
    catch { setNotice('Avatar upload failed. Use JPEG, PNG or WebP up to 5 MB.'); }
    finally { setUploading(false); event.target.value = ''; }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setNotice('');
    try { await profileApi.update(displayName, bio); onProfileUpdated(displayName.trim()); setNotice('Profile updated.'); }
    catch { setNotice('Could not update profile.'); }
    finally { setSaving(false); }
  }

  const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]?.toUpperCase()).join('') || 'U';
  return <section className="card profile-card">
    <div className="section-heading"><div><p className="eyebrow">Account</p><h2>Profile</h2></div><span className="status-dot">Active</span></div>
    {loading ? <p className="muted">Loading profile…</p> : <>
      <div className="profile-identity">
        <div className="profile-avatar">{avatarUrl ? <img src={avatarUrl} alt="Profile avatar" /> : <span>{initials}</span>}</div>
        <div><strong>{displayName}</strong><p>{user.email}</p><button className="secondary" type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? 'Uploading…' : 'Change avatar'}</button><input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} /></div>
      </div>
      <form className="stack" onSubmit={submit}>
        <label>Display name<input maxLength={120} value={displayName} onChange={e => setDisplayName(e.target.value)} /></label>
        <label>Bio<textarea rows={4} maxLength={500} placeholder="A short introduction…" value={bio} onChange={e => setBio(e.target.value)} /></label>
        <div className="form-footer"><span className="hint">{bio.length}/500 · avatar max 5 MB</span><button className="primary" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button></div>
        {notice && <p className="notice">{notice}</p>}
      </form>
    </>}
  </section>;
}
