'use client';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, GraduationCap, DollarSign } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';

type Stats = {
  totals: { users: number; courses: number; enrollments: number; revenue: number };
  trend: { month: string; value: number }[];
};

export default function AdminOverview() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api<Stats>('/api/users/admin/stats'),
  });
  const { data: recent } = useQuery({
    queryKey: ['admin-recent'],
    queryFn: () => api<{ recent: { id: string; createdAt: string; user: { name: string; email: string; avatar?: string | null }; course: { title: string } }[] }>(
      '/api/users/admin/recent-enrollments'
    ),
  });

  const totals = data?.totals;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-fg-muted">Key metrics across your platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI icon={<Users size={18} />} label="Total Users" value={formatNumber(totals?.users ?? 0)} delta="+12.5%" />
        <KPI icon={<BookOpen size={18} />} label="Total Courses" value={String(totals?.courses ?? 0)} delta="+8.2%" />
        <KPI icon={<GraduationCap size={18} />} label="Total Enrollments" value={formatNumber(totals?.enrollments ?? 0)} delta="+15.2%" />
        <KPI icon={<DollarSign size={18} />} label="Total Revenue" value={`$${formatNumber(totals?.revenue ?? 0)}`} delta="+18.7%" />
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Revenue Overview</h3>
            <p className="text-xs text-fg-muted">Last 6 months</p>
          </div>
          <div className="text-xs text-fg-muted">This Month</div>
        </div>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.trend || []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--fg-muted))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--fg-muted))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
                labelStyle={{ color: 'hsl(var(--fg))' }}
              />
              <Area type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-lg font-semibold">Recent Enrollments</h3>
        <div className="mt-4 divide-y divide-border">
          {(recent?.recent || []).map((e) => (
            <div key={e.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white">
                  {e.user.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium">{e.user.name}</div>
                  <div className="text-xs text-fg-muted">Just enrolled in <span className="text-primary">{e.course.title}</span></div>
                </div>
              </div>
              <div className="text-xs text-fg-muted">{new Date(e.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
          {(recent?.recent || []).length === 0 && (
            <div className="py-10 text-center text-sm text-fg-muted">No recent enrollments.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function KPI({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta?: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-fg-muted">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {delta && <div className="mt-1 text-xs font-medium text-success">↑ {delta}</div>}
    </div>
  );
}
