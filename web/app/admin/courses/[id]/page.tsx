'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, GripVertical, Save, Upload, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { api, API_BASE } from '@/lib/api';
import { cn } from '@/lib/utils';

type Lesson = { id: string; title: string; order: number; duration: number; videoUrl?: string | null; videoKey?: string | null; content?: string | null };
type Section = { id: string; title: string; order: number; lessons: Lesson[] };
type Course = {
  id: string; slug: string; title: string; summary: string; description: string;
  thumbnail: string; category: string; difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price: number; isFree: boolean; status: 'DRAFT' | 'PUBLISHED';
  sections: Section[];
};

export default function AdminCourseEditor() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-course', id],
    queryFn: async () => {
      // Fetch via all-admin list then find, OR better: slug endpoint is public
      // We'll just fetch full list of admin and find matching
      // Simpler: call courses/admin/all once
      const list = await api<{ courses: (Course & any)[] }>('/api/courses/admin/all');
      const found = list.courses.find((c) => c.id === id);
      if (!found) throw new Error('Not found');
      // Also fetch slug endpoint to get sections+lessons
      const detail = await api<{ course: Course }>(`/api/courses/slug/${found.slug}`);
      return detail.course;
    },
  });

  const [form, setForm] = useState<Partial<Course>>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const saveCourse = useMutation({
    mutationFn: () => api(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: form.title, summary: form.summary, description: form.description,
        thumbnail: form.thumbnail, category: form.category, difficulty: form.difficulty,
        price: Number(form.price), isFree: Boolean(form.isFree), status: form.status,
      }),
    }),
    onSuccess: () => { toast.success('Saved'); qc.invalidateQueries({ queryKey: ['admin-course', id] }); qc.invalidateQueries({ queryKey: ['admin-courses'] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const addSection = useMutation({
    mutationFn: () => api(`/api/courses/${id}/sections`, { method: 'POST', body: JSON.stringify({ title: 'New section' }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-course', id] }),
  });
  const updateSection = useMutation({
    mutationFn: ({ sectionId, title }: { sectionId: string; title: string }) =>
      api(`/api/courses/sections/${sectionId}`, { method: 'PUT', body: JSON.stringify({ title }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-course', id] }),
  });
  const deleteSection = useMutation({
    mutationFn: (sectionId: string) => api(`/api/courses/sections/${sectionId}`, { method: 'DELETE' }),
    onSuccess: () => { toast.success('Deleted'); qc.invalidateQueries({ queryKey: ['admin-course', id] }); },
  });
  const reorderSections = useMutation({
    mutationFn: (order: string[]) => api('/api/courses/sections/reorder', { method: 'POST', body: JSON.stringify({ order }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-course', id] }),
  });
  const addLesson = useMutation({
    mutationFn: (sectionId: string) => api(`/api/courses/sections/${sectionId}/lessons`, {
      method: 'POST', body: JSON.stringify({ title: 'New lesson', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: 600 }),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-course', id] }),
  });
  const updateLesson = useMutation({
    mutationFn: ({ lessonId, body }: { lessonId: string; body: Partial<Lesson> }) =>
      api(`/api/courses/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-course', id] }),
  });
  const deleteLesson = useMutation({
    mutationFn: (lessonId: string) => api(`/api/courses/lessons/${lessonId}`, { method: 'DELETE' }),
    onSuccess: () => { toast.success('Lesson deleted'); qc.invalidateQueries({ queryKey: ['admin-course', id] }); },
  });
  const reorderLessons = useMutation({
    mutationFn: (order: string[]) => api('/api/courses/lessons/reorder', { method: 'POST', body: JSON.stringify({ order }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-course', id] }),
  });

  function onDragEnd(result: DropResult) {
    if (!result.destination || !data) return;
    const { source, destination, type } = result;
    if (type === 'SECTION') {
      const items = [...data.sections];
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);
      reorderSections.mutate(items.map((s) => s.id));
    } else if (type === 'LESSON') {
      // Only reorder within same section for simplicity
      if (source.droppableId !== destination.droppableId) return;
      const section = data.sections.find((s) => s.id === source.droppableId);
      if (!section) return;
      const items = [...section.lessons];
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);
      reorderLessons.mutate(items.map((l) => l.id));
    }
  }

  if (isLoading || !data) return <div className="skeleton h-96 w-full rounded-2xl" />;

  return (
    <div>
      <Link href="/admin/courses" className="btn-ghost mb-3 gap-1 text-sm"><ChevronLeft size={14} /> Back to courses</Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Course</h1>
          <p className="mt-1 text-sm text-fg-muted">Update details and structure.</p>
        </div>
        <button onClick={() => saveCourse.mutate()} disabled={saveCourse.isPending} className="btn-primary gap-2">
          <Save size={14} /> {saveCourse.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2 space-y-4 p-5">
          <h2 className="text-sm font-semibold">Details</h2>
          <Field label="Title"><input className="input" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Summary"><input className="input" value={form.summary || ''} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></Field>
          <Field label="Description (supports line breaks)">
            <textarea className="input min-h-[120px]" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Category"><input className="input" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Difficulty">
              <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </Field>
            <Field label="Price (USD)">
              <input type="number" className="input" value={form.price ?? 0} onChange={(e) => setForm({ ...form, price: Number(e.target.value), isFree: Number(e.target.value) === 0 })} />
            </Field>
          </div>
          <Field label="Thumbnail URL"><input className="input" value={form.thumbnail || ''} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} /></Field>
          <Field label="Status">
            <div className="flex gap-2">
              {(['DRAFT', 'PUBLISHED'] as const).map((s) => (
                <button key={s} onClick={() => setForm({ ...form, status: s })} className={cn('btn-outline text-sm', form.status === s && 'border-primary text-primary')}>
                  {s === 'PUBLISHED' ? 'Published' : 'Draft'}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="card space-y-3 p-5">
          <h2 className="text-sm font-semibold">Preview</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.thumbnail} alt="" className="aspect-video w-full rounded-xl object-cover" />
          <div className="text-xs uppercase text-primary">{form.category}</div>
          <div className="font-semibold">{form.title}</div>
          <p className="text-sm text-fg-muted">{form.summary}</p>
        </div>
      </div>

      <div className="card mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Curriculum</h2>
          <button onClick={() => addSection.mutate()} className="btn-outline gap-2 text-sm"><Plus size={14} /> Add section</button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sections" type="SECTION">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="mt-4 space-y-3">
                {data.sections.map((s, idx) => (
                  <Draggable draggableId={s.id} index={idx} key={s.id}>
                    {(p) => (
                      <div ref={p.innerRef} {...p.draggableProps} className="rounded-xl border border-border bg-bg-subtle">
                        <div className="flex items-center gap-2 p-3">
                          <span {...p.dragHandleProps} className="cursor-grab text-fg-muted"><GripVertical size={16} /></span>
                          <input
                            defaultValue={s.title}
                            onBlur={(e) => e.target.value !== s.title && updateSection.mutate({ sectionId: s.id, title: e.target.value })}
                            className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                          />
                          <button onClick={() => addLesson.mutate(s.id)} className="btn-ghost gap-1 text-xs"><Plus size={12} /> Lesson</button>
                          <button onClick={() => { if (confirm('Delete section and its lessons?')) deleteSection.mutate(s.id); }} className="btn-ghost h-8 w-8 p-0 text-danger"><Trash2 size={14} /></button>
                        </div>
                        <Droppable droppableId={s.id} type="LESSON">
                          {(p2) => (
                            <ul ref={p2.innerRef} {...p2.droppableProps} className="space-y-1 border-t border-border p-2">
                              {s.lessons.map((l, li) => (
                                <Draggable draggableId={l.id} index={li} key={l.id}>
                                  {(pp) => (
                                    <li ref={pp.innerRef} {...pp.draggableProps} className="rounded-lg bg-bg-card">
                                      <LessonRow
                                        lesson={l}
                                        dragHandle={<span {...pp.dragHandleProps} className="cursor-grab text-fg-muted"><GripVertical size={14} /></span>}
                                        onChange={(body) => updateLesson.mutate({ lessonId: l.id, body })}
                                        onDelete={() => deleteLesson.mutate(l.id)}
                                      />
                                    </li>
                                  )}
                                </Draggable>
                              ))}
                              {p2.placeholder}
                              {s.lessons.length === 0 && <li className="p-3 text-xs text-fg-muted">No lessons yet. Click "Lesson" to add one.</li>}
                            </ul>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {data.sections.length === 0 && <div className="p-10 text-center text-sm text-fg-muted">No sections. Add one to get started.</div>}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-fg-muted">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function LessonRow({ lesson, onChange, onDelete, dragHandle }: {
  lesson: Lesson;
  onChange: (body: Partial<Lesson>) => void;
  onDelete: () => void;
  dragHandle: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const access = localStorage.getItem('learnify.accessToken');
      const res = await fetch(`${API_BASE}/api/video/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${access}` }, body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const d = await res.json();
      onChange({ videoUrl: d.url, videoKey: d.key });
      toast.success('Video uploaded');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 p-2">
        {dragHandle}
        <input
          defaultValue={lesson.title}
          onBlur={(e) => e.target.value !== lesson.title && onChange({ title: e.target.value })}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
        <button onClick={() => setOpen((v) => !v)} className="btn-ghost h-7 px-2 text-xs">
          <ChevronDown size={14} className={cn('transition', open && 'rotate-180')} />
        </button>
        <button onClick={() => { if (confirm('Delete lesson?')) onDelete(); }} className="btn-ghost h-7 w-7 p-0 text-danger"><Trash2 size={13} /></button>
      </div>
      {open && (
        <div className="space-y-2 border-t border-border p-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-fg-muted">Video URL</span>
              <input
                className="input mt-1"
                defaultValue={lesson.videoUrl || ''}
                onBlur={(e) => e.target.value !== lesson.videoUrl && onChange({ videoUrl: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-xs text-fg-muted">Duration (seconds)</span>
              <input
                type="number" className="input mt-1"
                defaultValue={lesson.duration}
                onBlur={(e) => Number(e.target.value) !== lesson.duration && onChange({ duration: Number(e.target.value) })}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs text-fg-muted">Content (rich text / notes)</span>
            <textarea
              className="input mt-1 min-h-[80px]"
              defaultValue={lesson.content || ''}
              onBlur={(e) => e.target.value !== (lesson.content || '') && onChange({ content: e.target.value })}
            />
          </label>
          <div className="flex items-center gap-2 pt-1">
            <label className="btn-outline cursor-pointer gap-2 text-xs">
              <Upload size={12} />
              {uploading ? 'Uploading…' : 'Upload video'}
              <input type="file" accept="video/*" className="hidden" onChange={handleUpload} />
            </label>
            <span className="text-[11px] text-fg-muted">or use S3 presigned URL in production</span>
          </div>
        </div>
      )}
    </div>
  );
}
