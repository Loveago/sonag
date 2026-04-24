'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { CourseCard, CourseCardSkeleton, CourseCardData } from '@/components/course-card';

export function CoursesPreview() {
  const { data, isLoading } = useQuery({
    queryKey: ['courses-preview'],
    queryFn: () => api<{ courses: CourseCardData[] }>('/api/courses?sort=popular'),
  });
  const courses = (data?.courses || []).slice(0, 6);
  return (
    <section className="py-20">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="chip mb-3">Browse Courses</div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Find the perfect course</h2>
            <p className="mt-2 text-fg-muted">Hand-picked courses to advance your career.</p>
          </div>
          <Link href="/courses" className="btn-ghost gap-2 text-sm">See all <ArrowRight size={14} /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
            : courses.map((c, i) => (
                <CourseCard
                  key={c.id}
                  course={{
                    ...c,
                    badge: i === 0 ? 'Bestseller' : i === 3 ? 'New' : undefined,
                  }}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
