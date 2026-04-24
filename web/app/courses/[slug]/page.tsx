'use client';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Clock, Users, Star, ChevronDown, CheckCircle2, Lock } from 'lucide-react';
import { formatDuration, formatMoney, formatNumber, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-store';
import toast from 'react-hot-toast';

type Lesson = { id: string; title: string; duration: number; order: number };
type Section = { id: string; title: string; order: number; lessons: Lesson[] };
type Course = {
  id: string; slug: string; title: string; description: string; summary: string;
  thumbnail: string; category: string; difficulty: string; price: number; isFree: boolean;
  rating: number; ratingCount: number; studentCount: number; duration: number;
  sections: Section[];
};

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const user = useAuth((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => api<{ course: Course }>(`/api/courses/slug/${slug}`),
  });

  const course = data?.course;
  const totalLessons = course?.sections.reduce((a, s) => a + s.lessons.length, 0) ?? 0;
  const totalSeconds = course?.sections.reduce((a, s) => a + s.lessons.reduce((b, l) => b + (l.duration || 0), 0), 0) ?? 0;

  const enroll = useMutation({
    mutationFn: () => api(`/api/courses/${course!.id}/enroll`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Enrolled!');
      if (course?.sections[0]?.lessons[0]) {
        router.push(`/learn/${course.slug}?lesson=${course.sections[0].lessons[0].id}`);
      } else {
        router.push('/dashboard');
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleEnroll = () => {
    if (!user) {
      router.push(`/login?next=/courses/${slug}`);
      return;
    }
    enroll.mutate();
  };

  if (isLoading || !course) {
    return (
      <>
        <Navbar />
        <main className="container py-10">
          <div className="skeleton h-64 w-full rounded-2xl" />
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-3"><div className="skeleton h-6 w-3/4" /><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-5/6" /></div>
            <div className="skeleton h-80 w-full rounded-2xl" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-0 bg-glow-purple" />
          <div className="container relative grid gap-8 py-10 md:grid-cols-3 md:py-14">
            <div className="md:col-span-2">
              <div className="text-xs font-medium uppercase tracking-widest text-primary">{course.category}</div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                {course.title}
              </motion.h1>
              <p className="mt-3 max-w-2xl text-fg-muted">{course.summary}</p>
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-fg-muted">
                <span className="flex items-center gap-1"><Star size={14} className="fill-warning text-warning" /> <span className="text-fg">{course.rating.toFixed(1)}</span> ({formatNumber(course.ratingCount)})</span>
                <span className="flex items-center gap-1"><Users size={14} />{formatNumber(course.studentCount)} students</span>
                <span className="flex items-center gap-1"><Clock size={14} />{formatDuration(totalSeconds)}</span>
                <span className="chip">{course.difficulty}</span>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="card overflow-hidden">
                <div className="relative aspect-[16/10]">
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <button className="absolute inset-0 flex items-center justify-center text-white">
                    <PlayCircle size={56} className="opacity-90" />
                  </button>
                </div>
                <div className="space-y-3 p-4">
                  <div className="text-3xl font-semibold">{formatMoney(course.price)}</div>
                  <button
                    disabled={enroll.isPending}
                    onClick={handleEnroll}
                    className="btn-primary w-full"
                  >
                    {enroll.isPending ? 'Enrolling…' : user ? 'Enroll now' : 'Sign in to enroll'}
                  </button>
                  <ul className="space-y-1.5 text-sm text-fg-muted">
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> {totalLessons} lessons</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> {course.sections.length} sections</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> Lifetime access</li>
                    <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success" /> Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container grid gap-10 py-12 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold">About this course</h2>
            <p className="mt-3 whitespace-pre-line text-fg-muted">{course.description}</p>
            <h2 className="mt-10 text-xl font-semibold">Course content</h2>
            <div className="mt-4 space-y-3">
              {course.sections.map((s) => (
                <SectionAccordion key={s.id} section={s} />
              ))}
            </div>
          </div>
          <aside className="md:col-span-1">
            <div className="card sticky top-24 p-5">
              <h3 className="text-sm font-semibold">What you'll learn</h3>
              <ul className="mt-3 space-y-2 text-sm text-fg-muted">
                {['Foundational concepts', 'Practical real-world examples', 'Best practices & patterns', 'Hands-on projects'].map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 text-success" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SectionAccordion({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-bg-subtle"
      >
        <div>
          <div className="font-medium">{section.title}</div>
          <div className="text-xs text-fg-muted">{section.lessons.length} lessons</div>
        </div>
        <ChevronDown size={16} className={cn('transition', open && 'rotate-180')} />
      </button>
      {open && (
        <ul className="divide-y divide-border border-t border-border">
          {section.lessons.map((l) => (
            <li key={l.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="flex items-center gap-3 text-fg-muted">
                <Lock size={14} /> {l.title}
              </span>
              <span className="text-xs text-fg-muted">{formatDuration(l.duration)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
