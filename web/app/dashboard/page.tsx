'use client';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Trophy, TrendingUp, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-store';
import { CourseCard, CourseCardSkeleton, CourseCardData } from '@/components/course-card';
import { formatDuration, formatTime } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !user) router.replace('/login?next=/dashboard');
  }, [hydrated, user, router]);

  const { data: stats } = useQuery({
    queryKey: ['me-stats'],
    queryFn: () => api<{ enrolled: number; avgProgress: number; timeSpentSeconds: number; certificates: number }>('/api/users/me/stats'),
    enabled: !!user,
  });
  const { data: enrolls, isLoading: loadingEnrolls } = useQuery({
    queryKey: ['me-enrollments'],
    queryFn: () => api<{ enrollments: { course: CourseCardData; progress: number }[] }>('/api/users/me/enrollments'),
    enabled: !!user,
  });
  const { data: recents } = useQuery({
    queryKey: ['me-recent'],
    queryFn: () => api<{ recents: { lessonId: string; lessonTitle: string; position: number; duration: number; completed: boolean; updatedAt: string; course: { id: string; slug: string; title: string; thumbnail: string } }[] }>('/api/users/me/recent'),
    enabled: !!user,
  });

  if (!user) return null;

  const enrollments = enrolls?.enrollments || [];

  return (
    <>
      <Navbar />
      <main className="container py-10">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">My Dashboard</h1>
              <p className="mt-1 text-fg-muted">Welcome back, {user.name.split(' ')[0]}! 👋 Continue your learning journey.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<BookOpen size={18} />} label="Enrolled Courses" value={String(stats?.enrolled ?? 0)} />
            <StatCard icon={<TrendingUp size={18} />} label="Average Progress" value={`${stats?.avgProgress ?? 0}%`} />
            <StatCard icon={<Clock size={18} />} label="Time Spent" value={formatDuration(stats?.timeSpentSeconds ?? 0)} />
            <StatCard icon={<Trophy size={18} />} label="Certificates" value={String(stats?.certificates ?? 0)} />
          </div>

          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Continue Learning</h2>
              <Link href="/courses" className="btn-ghost text-sm">Browse all <ChevronRight size={14} /></Link>
            </div>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {loadingEnrolls
                ? Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)
                : enrollments.length === 0
                ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center">
                    <p className="text-fg-muted">You haven't enrolled in any courses yet.</p>
                    <Link href="/courses" className="btn-primary mt-4 inline-flex">Explore Courses</Link>
                  </div>
                )
                : enrollments.map((e) => (
                  <CourseCard
                    key={e.course.id}
                    href={`/learn/${e.course.slug}`}
                    course={{ ...e.course, progress: e.progress }}
                  />
                ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">Recently Watched</h2>
            <div className="mt-4 card overflow-hidden">
              {(recents?.recents || []).length === 0 && (
                <div className="p-10 text-center text-sm text-fg-muted">Nothing watched yet.</div>
              )}
              <ul className="divide-y divide-border">
                {(recents?.recents || []).map((r) => (
                  <li key={r.lessonId}>
                    <Link href={`/learn/${r.course.slug}?lesson=${r.lessonId}`} className="flex items-center gap-4 p-4 hover:bg-bg-subtle">
                      <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-bg-subtle">
                        <Image src={r.course.thumbnail} alt="" fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{r.lessonTitle}</div>
                        <div className="truncate text-xs text-fg-muted">{r.course.title}</div>
                      </div>
                      <div className="text-right text-xs text-fg-muted">
                        <div>{formatTime(r.position)} / {formatTime(r.duration)}</div>
                        <div>{new Date(r.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-fg-muted">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
