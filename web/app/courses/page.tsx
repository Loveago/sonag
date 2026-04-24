'use client';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { CourseCard, CourseCardSkeleton, CourseCardData } from '@/components/course-card';
import { motion } from 'framer-motion';

type Category = { name: string; count: number };

export default function CoursesPage() {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [category, setCategory] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (debounced) p.set('q', debounced);
    if (category !== 'all') p.set('category', category);
    if (difficulty !== 'all') p.set('difficulty', difficulty);
    if (sort) p.set('sort', sort);
    return p.toString();
  }, [debounced, category, difficulty, sort]);

  const { data, isLoading } = useQuery({
    queryKey: ['courses', params],
    queryFn: () => api<{ courses: CourseCardData[] }>(`/api/courses?${params}`),
  });
  const { data: catData } = useQuery({
    queryKey: ['course-categories'],
    queryFn: () => api<{ categories: Category[] }>(`/api/courses/categories`),
  });

  const courses = data?.courses || [];

  return (
    <>
      <Navbar />
      <main className="container py-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Browse Courses</h1>
              <p className="mt-1 text-fg-muted">Find the perfect course to advance your career.</p>
            </div>
            <div className="text-sm text-fg-muted">
              {isLoading ? 'Loading…' : `${courses.length} results`}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search courses…"
                className="input pl-9"
              />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input w-auto">
              <option value="all">All categories</option>
              {(catData?.categories || []).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.count})
                </option>
              ))}
            </select>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input w-auto">
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-auto">
              <option value="newest">Newest</option>
              <option value="popular">Most popular</option>
              <option value="rating">Top rated</option>
            </select>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)
              : courses.length === 0
              ? <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-fg-muted">No courses found. Try a different search.</div>
              : courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
