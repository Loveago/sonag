'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LayoutDashboard, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // hide on admin/player routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/learn/')) return null;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all',
        scrolled ? 'border-b border-border bg-bg/80 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm text-fg-muted transition hover:bg-bg-subtle hover:text-fg',
                  pathname === n.href && 'text-fg',
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenu((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-2 py-1 pr-3 text-sm"
              >
                <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white">
                  {user.name[0]?.toUpperCase()}
                </div>
                <span className="hidden md:block">{user.name.split(' ')[0]}</span>
              </button>
              <AnimatePresence>
                {menu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-bg-card shadow-soft"
                    onMouseLeave={() => setMenu(false)}
                  >
                    <div className="border-b border-border px-3 py-3">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-fg-muted">{user.email}</div>
                    </div>
                    <MenuItem href="/dashboard" icon={<LayoutDashboard size={15} />}>Dashboard</MenuItem>
                    <MenuItem href="/profile" icon={<UserIcon size={15} />}>Profile</MenuItem>
                    {user.role === 'ADMIN' && (
                      <MenuItem href="/admin" icon={<Shield size={15} />}>Admin Panel</MenuItem>
                    )}
                    <button
                      onClick={async () => { await logout(); router.push('/'); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-bg-subtle"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className="btn-ghost">Login</Link>
              <Link href="/register" className="btn-primary">Get Started</Link>
            </div>
          )}
          <button onClick={() => setOpen((v) => !v)} className="btn-ghost h-9 w-9 p-0 md:hidden" aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="container flex flex-col gap-1 py-3">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-bg-subtle"
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                {user ? (
                  <>
                    <Link href="/dashboard" className="btn-outline flex-1">Dashboard</Link>
                    <button onClick={logout} className="btn-ghost">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="btn-outline flex-1">Login</Link>
                    <Link href="/register" className="btn-primary flex-1">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuItem({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-subtle">
      {icon} {children}
    </Link>
  );
}
