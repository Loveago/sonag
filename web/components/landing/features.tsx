'use client';
import { motion } from 'framer-motion';
import {
  Video, Shield, Infinity as InfIcon, BookOpen, Trophy, Sparkles,
} from 'lucide-react';

const features = [
  { icon: Video, title: '4K Video Lessons', desc: 'Crystal-clear streaming with adaptive quality and resume-anywhere.' },
  { icon: BookOpen, title: 'Structured Curriculum', desc: 'Carefully designed sections and lessons that build on each other.' },
  { icon: Trophy, title: 'Certificates', desc: 'Earn shareable certificates when you complete a course.' },
  { icon: Shield, title: 'Secure Streaming', desc: 'Videos served via signed URLs, protecting creator content.' },
  { icon: InfIcon, title: 'Lifetime Access', desc: 'Buy once, revisit forever. No subscriptions required.' },
  { icon: Sparkles, title: 'Notes & Bookmarks', desc: 'Capture ideas per lesson and return to your favourite moments.' },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="relative py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="chip mb-3 mx-auto">Why Learnify</div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Everything you need to master a new skill</h2>
          <p className="mt-3 text-fg-muted">
            Beautifully crafted tools for focused learning — from the first lesson to your certificate.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="card group relative overflow-hidden p-6"
            >
              <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-80" />
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                <f.icon size={20} />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-fg-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
