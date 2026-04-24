'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type AdminUser = {
  id: string; name: string; email: string; avatar: string | null; role: 'USER' | 'ADMIN';
  createdAt: string; _count: { enrollments: number };
};

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<{ users: AdminUser[] }>('/api/users'),
  });
  const del = useMutation({
    mutationFn: (id: string) => api(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="mt-1 text-sm text-fg-muted">Manage platform users.</p>
      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Enrolled</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={5} className="p-10 text-center text-fg-muted">Loading…</td></tr>}
              {(data?.users || []).map((u) => (
                <tr key={u.id} className="hover:bg-bg-subtle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-white">
                        {u.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-fg-muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', u.role === 'ADMIN' ? 'bg-primary/15 text-primary' : 'bg-bg-subtle text-fg-muted')}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{u._count.enrollments}</td>
                  <td className="px-4 py-3 text-fg-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => { if (confirm(`Delete ${u.email}?`)) del.mutate(u.id); }}
                        disabled={u.role === 'ADMIN'}
                        className="btn-ghost h-8 w-8 p-0 text-danger disabled:opacity-30"
                      ><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
