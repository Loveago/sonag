'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, CheckCircle2, PlayCircle, Bookmark, BookmarkCheck, FileText, Send, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { VideoPlayer } from '@/components/video-player';
import { formatDuration, formatTime, cn } from '@/lib/utils';

type Course = {
  id: string; slug: string; title: string;
  sections: { id: string; title: string; order: number;
    lessons: { id: string; title: string; order: number; duration: number }[] }[];
};
type LessonData = {
  lesson: { id: string; title: string; duration: number; content: string | null; videoUrl: string | null; course: { id: string; title: string; slug: string } };
  progress: { position: number; completed: boolean } | null;
};

export default function LearnPage() {
  const { slug } = useParams<{ slug: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !user) router.replace(`/login?next=/learn/${slug}`);
  }, [user, hydrated, router, slug]);

  const { data: courseData } = useQuery({
    queryKey: ['course-learn', slug],
    queryFn: () => api<{ course: Course }>(`/api/courses/slug/${slug}`),
  });
  const course = courseData?.course;

  const lessonId = sp.get('lesson') || course?.sections[0]?.lessons[0]?.id;

  const { data: lessonData, isLoading: lessonLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => api<LessonData>(`/api/courses/lessons/${lessonId}`),
    enabled: !!lessonId && !!user,
  });

  const { data: progresses } = useQuery({
    queryKey: ['progress-course', course?.id],
    queryFn: () => api<{ progresses: { lessonId: string; completed: boolean; position: number }[] }>(`/api/progress/course/${course!.id}`),
    enabled: !!course?.id && !!user,
  });

  const saveProgress = useMutation({
    mutationFn: (body: { lessonId: string; position: number; completed?: boolean }) =>
      api('/api/progress', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['progress-course', course?.id] }),
  });

  const { data: notes } = useQuery({
    queryKey: ['notes', lessonId],
    queryFn: () => api<{ notes: { id: string; content: string; timestamp: number }[] }>(`/api/progress/notes/${lessonId}`),
    enabled: !!lessonId && !!user,
  });

  const addNote = useMutation({
    mutationFn: (body: { lessonId: string; content: string; timestamp: number }) =>
      api('/api/progress/notes', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes', lessonId] }); setNoteText(''); toast.success('Note saved'); },
  });
  const deleteNote = useMutation({
    mutationFn: (id: string) => api(`/api/progress/notes/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', lessonId] }),
  });

  const { data: bookmarkList } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => api<{ bookmarks: { lessonId: string }[] }>('/api/progress/bookmarks'),
    enabled: !!user,
  });
  const toggleBookmark = useMutation({
    mutationFn: async ({ lessonId, active }: { lessonId: string; active: boolean }) => {
      if (active) await api(`/api/progress/bookmarks/${lessonId}`, { method: 'DELETE' });
      else await api(`/api/progress/bookmarks/${lessonId}`, { method: 'POST' });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookmarks'] }),
  });

  const [noteText, setNoteText] = useState('');
  const [currentTime, setCurrentTime] = useState(0);

  const completedIds = new Set((progresses?.progresses || []).filter((p) => p.completed).map((p) => p.lessonId));
  const bookmarkedIds = new Set((bookmarkList?.bookmarks || []).map((b) => b.lessonId));
  const isBookmarked = lessonId ? bookmarkedIds.has(lessonId) : false;

  const allLessons = course?.sections.flatMap((s) => s.lessons) || [];
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prev = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const next = currentIdx >= 0 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  if (!hydrated || !user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-border bg-bg px-4 py-2">
        <Link href={`/courses/${slug}`} className="btn-ghost gap-1 text-sm">
          <ChevronLeft size={14} /> Back to Course
        </Link>
        <div className="truncate text-sm font-medium">{course?.title}</div>
        <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
      </header>

      <div className="grid flex-1 md:grid-cols-[1fr_360px]">
        <main className="p-4 md:p-6">
          {lessonLoading || !lessonData ? (
            <div className="skeleton aspect-video w-full rounded-2xl" />
          ) : (
            <>
              <VideoPlayer
                src={lessonData.lesson.videoUrl || ''}
                initialTime={lessonData.progress?.position || 0}
                onProgress={(pos, dur) => {
                  setCurrentTime(pos);
                  saveProgress.mutate({
                    lessonId: lessonData.lesson.id,
                    position: Math.round(pos),
                    completed: dur > 0 && pos / dur > 0.9,
                  });
                }}
                onEnded={() => {
                  saveProgress.mutate({
                    lessonId: lessonData.lesson.id,
                    position: Math.round(lessonData.lesson.duration),
                    completed: true,
                  });
                  if (next) router.push(`/learn/${slug}?lesson=${next.id}`);
                }}
              />
              <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold md:text-2xl">{lessonData.lesson.title}</h1>
                  <div className="mt-1 text-sm text-fg-muted">{formatDuration(lessonData.lesson.duration)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark.mutate({ lessonId: lessonData.lesson.id, active: isBookmarked })}
                    className={cn('btn-outline gap-2 text-sm', isBookmarked && 'border-primary text-primary')}
                  >
                    {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button
                    onClick={() => saveProgress.mutate({
                      lessonId: lessonData.lesson.id,
                      position: Math.round(currentTime),
                      completed: true,
                    })}
                    className="btn-primary gap-2 text-sm"
                  >
                    <CheckCircle2 size={14} /> Mark as Complete
                  </button>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                {prev ? (
                  <Link href={`/learn/${slug}?lesson=${prev.id}`} className="btn-outline text-sm">← Previous Lesson</Link>
                ) : <span />}
                {next && (
                  <Link href={`/learn/${slug}?lesson=${next.id}`} className="btn-primary ml-auto text-sm">Next Lesson →</Link>
                )}
              </div>

              {lessonData.lesson.content && (
                <div className="card mt-6 p-5">
                  <h3 className="text-sm font-semibold">Lesson notes</h3>
                  <p className="mt-2 whitespace-pre-line text-sm text-fg-muted">{lessonData.lesson.content}</p>
                </div>
              )}

              <div className="card mt-6 p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold"><FileText size={14} /> My notes</h3>
                <div className="mt-3 flex gap-2">
                  <input
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={`Add a note at ${formatTime(currentTime)}…`}
                    className="input flex-1"
                  />
                  <button
                    disabled={!noteText.trim() || addNote.isPending}
                    onClick={() => addNote.mutate({ lessonId: lessonData.lesson.id, content: noteText.trim(), timestamp: Math.round(currentTime) })}
                    className="btn-primary gap-1 text-sm"
                  >
                    <Send size={14} /> Save
                  </button>
                </div>
                <ul className="mt-4 space-y-2">
                  {(notes?.notes || []).map((n) => (
                    <li key={n.id} className="flex items-start justify-between gap-2 rounded-lg border border-border bg-bg-subtle p-3 text-sm">
                      <div>
                        <div className="text-xs text-primary">{formatTime(n.timestamp)}</div>
                        <div>{n.content}</div>
                      </div>
                      <button onClick={() => deleteNote.mutate(n.id)} className="text-fg-muted hover:text-danger">
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                  {(notes?.notes || []).length === 0 && <li className="text-sm text-fg-muted">No notes yet.</li>}
                </ul>
              </div>
            </>
          )}
        </main>

        <aside className="border-t border-border md:border-l md:border-t-0">
          <div className="sticky top-0 max-h-screen overflow-auto scroll-thin p-4">
            <div className="px-2 pb-3 text-sm font-semibold">Course Content</div>
            {course?.sections.map((s) => (
              <div key={s.id} className="mb-3">
                <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-fg-muted">{s.title}</div>
                <ul className="mt-1 space-y-0.5">
                  {s.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/learn/${slug}?lesson=${l.id}`}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-bg-subtle',
                          l.id === lessonId && 'bg-primary/10 text-primary',
                        )}
                      >
                        {completedIds.has(l.id)
                          ? <CheckCircle2 size={14} className="shrink-0 text-success" />
                          : <PlayCircle size={14} className="shrink-0 text-fg-muted" />}
                        <span className="flex-1 truncate">{l.title}</span>
                        <span className="shrink-0 text-[11px] text-fg-muted">{formatDuration(l.duration)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
