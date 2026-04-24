'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, BookOpen, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const hydrated = useAuth((s) => s.hydrated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && (!user || user.role !== 'ADMIN')) router.replace('/login?next=/admin');
  }, [hydrated, user, router]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-bg-card">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo />
          <span className="ml-2 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Admin</span>
        </div>
        <nav className="space-y-0.5 p-3">
          {items.map((it) => {
            const active = pathname === it.href || (it.href !== '/admin' && pathname?.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                  active
                    ? 'bg-primary/15 font-medium text-primary'
                    : 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
                )}
              >
                <it.icon size={16} />
                {it.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-bg-card px-6">
          <div className="text-sm text-fg-muted">Admin Panel</div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-subtle px-2 py-1 pr-3">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white">
                {user.name[0]?.toUpperCase()}
              </div>
              <span className="text-sm">{user.name}</span>
            </div>
            <button onClick={logout} className="btn-ghost h-9 w-9 p-0" aria-label="Logout"><LogOut size={15} /></button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
