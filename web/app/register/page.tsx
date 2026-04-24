'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Logo } from '@/components/logo';
import { useAuth } from '@/lib/auth-store';
import { AuthLayout } from '@/components/auth-layout';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(name, email, password);
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      router.push('/dashboard');
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
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-fg-muted">Start learning today. No credit card required.</p>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-medium text-fg-muted">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="text-xs font-medium text-fg-muted">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs font-medium text-fg-muted">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input mt-1" placeholder="At least 6 characters" />
          </div>
        </div>
        <button disabled={loading} className="btn-primary mt-5 w-full">
          {loading ? 'Creating…' : 'Create account'}
        </button>
        <div className="mt-4 text-center text-sm text-fg-muted">
          Already have an account? <Link className="text-primary hover:underline" href="/login">Sign in</Link>
        </div>
      </motion.form>
    </AuthLayout>
  );
}
