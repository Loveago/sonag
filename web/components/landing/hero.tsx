'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-glow-purple" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="container relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl"
        >
          <span className="chip mb-4"><Sparkles size={12} className="text-primary" /> New · 10,000+ happy students</span>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Learn Without
            <br /> Limits. <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Grow</span>
            <br /> Without Boundaries.
          </h1>
          <p className="mt-5 text-lg text-fg-muted">
            Explore premium video courses on design, development, business and more.
            Learn anytime, anywhere.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/courses" className="btn-primary h-11 px-5">Explore Courses</Link>
            <button className="btn-outline h-11 gap-2 px-5">
              <Play size={14} /> Watch Demo
            </button>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <Image
                  key={i}
                  src={`https://i.pravatar.cc/48?img=${i * 7}`}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border-2 border-bg object-cover"
                />
              ))}
            </div>
            <div>
              <div className="text-sm font-semibold">10k+</div>
              <div className="text-xs text-fg-muted">Happy Learners</div>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6">
            <Stat label="Expert Instructors" desc="Learn from industry experts" />
            <Stat label="High Quality Content" desc="Premium video lessons" />
            <Stat label="Lifetime Access" desc="Learn at your own pace" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-primary/40 via-accent/30 to-transparent blur-3xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/40 to-accent/30 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1000&q=80"
              alt="Learnify preview"
              fill
              className="object-cover mix-blend-luminosity opacity-80"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="group grid h-20 w-20 place-items-center rounded-full bg-white/95 text-primary shadow-2xl transition hover:scale-110">
                <Play size={28} className="fill-primary" />
              </button>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-xl"
            >
              <div className="text-xs uppercase text-white/60">Now playing</div>
              <div className="mt-1 text-base font-semibold text-white">JavaScript Fundamentals</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, desc }: { label: string; desc: string }) {
  return (
    <div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-fg-muted">{desc}</div>
    </div>
  );
}
