'use client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '@/lib/api';

export default function AdminAnalytics() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api<{ totals: { users: number; courses: number; enrollments: number }; trend: { month: string; value: number }[] }>('/api/users/admin/stats'),
  });
  const { data: coursesList } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => api<{ courses: { title: string; studentCount: number; _count: { enrollments: number } }[] }>('/api/courses/admin/all'),
  });

  const top = (coursesList?.courses || []).slice(0, 6).map((c) => ({
    name: c.title.length > 18 ? c.title.slice(0, 18) + '…' : c.title,
    students: c._count?.enrollments ?? c.studentCount,
  }));

  const pieData = (coursesList?.courses || []).slice(0, 5).map((c) => ({
    name: c.title.length > 14 ? c.title.slice(0, 14) + '…' : c.title,
    value: c._count?.enrollments ?? c.studentCount ?? 0,
  }));

  const COLORS = ['#a855f7', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-fg-muted">Engagement and performance insights.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-semibold">Enrollments trend</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={stats?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--fg-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--fg-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                <Bar dataKey="value" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-lg font-semibold">Top courses by enrollment</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold">Top courses</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer>
              <BarChart data={top} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--fg-muted))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--fg-muted))" fontSize={12} tickLine={false} axisLine={false} width={140} />
                <Tooltip contentStyle={{ background: 'hsl(var(--bg-card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                <Bar dataKey="students" fill="#06b6d4" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
