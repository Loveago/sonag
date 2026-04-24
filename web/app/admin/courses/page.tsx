'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/utils';
import { cn } from '@/lib/utils';

type AdminCourse = {
  id: string; slug: string; title: string; thumbnail: string; status: 'DRAFT' | 'PUBLISHED';
  price: number; studentCount: number;
  _count: { sections: number; enrollments: number };
};

export default function AdminCoursesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => api<{ courses: AdminCourse[] }>('/api/courses/admin/all'),
  });

  const [creating, setCreating] = useState(false);

  const create = useMutation({
    mutationFn: () => api<{ course: AdminCourse }>('/api/courses', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Untitled course',
        summary: 'Edit to add a summary.',
        description: 'Edit to add a full description.',
        thumbnail: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=1200&q=80',
        category: 'General',
        difficulty: 'BEGINNER',
        price: 0,
        isFree: true,
        status: 'DRAFT',
      }),
    }),
    onSuccess: (d) => {
      toast.success('Course created');
      qc.invalidateQueries({ queryKey: ['admin-courses'] });
      window.location.href = `/admin/courses/${d.course.id}`;
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setCreating(false),
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/api/courses/${id}`, { method: 'DELETE' }),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-courses'] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage Courses</h1>
          <p className="mt-1 text-sm text-fg-muted">Create, edit and publish courses.</p>
        </div>
        <button
          disabled={creating}
          onClick={() => { setCreating(true); create.mutate(); }}
          className="btn-primary gap-2"
        >
          <Plus size={14} /> Add New Course
        </button>
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-subtle text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Course</th>
                <th className="px-4 py-3 text-left font-medium">Students</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={5} className="p-10 text-center text-fg-muted">Loading…</td></tr>}
              {(data?.courses || []).map((c) => (
                <tr key={c.id} className="hover:bg-bg-subtle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-16 shrink-0 overflow-hidden rounded-md bg-bg-subtle">
                        <Image src={c.thumbnail} alt="" fill className="object-cover" />
                      </div>
                      <div>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-xs text-fg-muted">{c._count.sections} sections · {c._count.enrollments} enrolled</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.studentCount}</td>
                  <td className="px-4 py-3">{formatMoney(c.price)}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      c.status === 'PUBLISHED' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
                    )}>
                      {c.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/courses/${c.slug}`} className="btn-ghost h-8 w-8 p-0"><Eye size={14} /></Link>
                      <Link href={`/admin/courses/${c.id}`} className="btn-ghost h-8 w-8 p-0"><Edit size={14} /></Link>
                      <button
                        onClick={() => { if (confirm('Delete this course?')) del.mutate(c.id); }}
                        className="btn-ghost h-8 w-8 p-0 text-danger"
                      ><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && (data?.courses || []).length === 0 && (
                <tr><td colSpan={5} className="p-10 text-center text-fg-muted">No courses yet. Create your first one!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
