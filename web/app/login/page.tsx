'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { AuthLayout } from '@/components/auth-layout';
import { useAuth } from '@/lib/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const login = useAuth((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const next = sp.get('next');
      router.push(next || (user.role === 'ADMIN' ? '/admin' : '/dashboard'));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-8"
      >
        <Logo className="mb-6" />
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-fg-muted">Sign in to continue learning.</p>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-fg-muted">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-fg-muted">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-1" placeholder="••••••••" />
          </div>
        </div>

        <button disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="mt-4 text-center text-sm text-fg-muted">
          Don't have an account? <Link className="text-primary hover:underline" href="/register">Sign up</Link>
        </div>
        <div className="mt-6 rounded-lg border border-dashed border-border bg-bg-subtle p-3 text-xs text-fg-muted">
          <div className="font-medium text-fg">Demo accounts</div>
          <div>Admin: admin@learnify.dev / admin123</div>
          <div>User: alex@learnify.dev / password123</div>
        </div>
      </motion.form>
    </AuthLayout>
  );
}

