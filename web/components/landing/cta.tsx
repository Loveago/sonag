'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section id="about" className="py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-bg-card to-accent/10 p-10 shadow-soft md:p-16">
          <div className="pointer-events-none absolute -top-20 left-1/2 h-60 w-[60%] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative mx-auto max-w-2xl text-center">
            <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Unlock unlimited access to all courses
            </h3>
            <p className="mt-3 text-fg-muted">
              Join Learnify Pro and get access to 200+ premium courses, new content every month.
            </p>
            <Link href="/register" className="btn-primary mt-6 h-11 gap-2 px-6">
              Get Pro Now <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
