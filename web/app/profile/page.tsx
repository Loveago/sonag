'use client';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';

export default function ProfilePage() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const hydrated = useAuth((s) => s.hydrated);
  const router = useRouter();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && !user) router.replace('/login?next=/profile');
    if (user) { setName(user.name); setAvatar(user.avatar || ''); }
  }, [user, hydrated, router]);

  async function save() {
    setLoading(true);
    try {
      const r = await api<{ user: any }>('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({ name, avatar: avatar || null }),
      });
      setUser(r.user);
      toast.success('Profile updated');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="container max-w-2xl py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-1 text-fg-muted">Manage your account details.</p>
        <div className="card mt-6 p-6">
          <div className="flex items-center gap-4">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xl font-semibold text-white">
                {user.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-fg-muted">{user.email}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-primary">{user.role}</div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div>
              <label className="text-xs font-medium text-fg-muted">Name</label>
              <input className="input mt-1" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-fg-muted">Avatar URL (optional)</label>
              <input className="input mt-1" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://…" />
            </div>
          </div>
          <button onClick={save} disabled={loading} className="btn-primary mt-5">
            {loading ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
