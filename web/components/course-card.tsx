'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock, Users, PlayCircle } from 'lucide-react';
import { formatMoney, formatNumber, cn } from '@/lib/utils';

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  summary?: string;
  category?: string;
  difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  price?: number;
  rating?: number;
  ratingCount?: number;
  studentCount?: number;
  duration?: number;
  progress?: number; // enrolled progress %
  badge?: string;
};

export function CourseCard({ course, href }: { course: CourseCardData; href?: string }) {
  const link = href || `/courses/${course.slug}`;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="group card overflow-hidden"
    >
      <Link href={link} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-bg-subtle">
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-primary shadow-xl">
              <PlayCircle size={28} />
            </span>
          </div>
          {course.badge && (
            <span className="absolute left-3 top-3 rounded-md bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
              {course.badge}
            </span>
          )}
          {course.difficulty && (
            <span className="absolute right-3 top-3 rounded-md bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
              {course.difficulty}
            </span>
          )}
        </div>

        <div className="p-4">
          {course.category && (
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-primary">
              {course.category}
            </div>
          )}
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{course.title}</h3>
          {course.summary && (
            <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{course.summary}</p>
          )}

          {typeof course.progress === 'number' ? (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-fg-muted">
                <span>Progress</span><span>{Math.round(course.progress)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between text-xs text-fg-muted">
              <span className="flex items-center gap-2">
                {course.rating != null && (
                  <span className="flex items-center gap-1">
                    <Star size={12} className="fill-warning text-warning" />
                    <span className="text-fg">{course.rating.toFixed(1)}</span>
                    {course.ratingCount != null && <span>({formatNumber(course.ratingCount)})</span>}
                  </span>
                )}
                {course.studentCount != null && (
                  <span className="flex items-center gap-1"><Users size={12} />{formatNumber(course.studentCount)}</span>
                )}
              </span>
              {course.duration ? (
                <span className="flex items-center gap-1"><Clock size={12} />{Math.round(course.duration / 3600)}h</span>
              ) : null}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className={cn('text-base font-semibold', (course.price ?? 0) === 0 && 'text-success')}>
              {formatMoney(course.price ?? 0)}
            </span>
            <span className="text-xs text-fg-muted transition group-hover:text-primary">View course →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[16/10]" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
      </div>
    </div>
  );
}
