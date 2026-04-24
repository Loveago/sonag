'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';

const items = [
  { name: 'Sarah Wilson', role: 'Frontend Engineer', text: 'The UI/UX masterclass was a game changer. Clean, focused lessons I could actually apply the next day.', img: 'https://i.pravatar.cc/80?img=15' },
  { name: 'Michael Brown', role: 'Full-Stack Developer', text: 'Best investment I made this year. The web dev bootcamp is worth every minute.', img: 'https://i.pravatar.cc/80?img=12' },
  { name: 'Emily Davis', role: 'Data Analyst', text: 'Python for data science was exactly what I needed. Loved the project-based approach.', img: 'https://i.pravatar.cc/80?img=5' },
  { name: 'John Doe', role: 'Product Designer', text: 'The bookmarks and notes make it effortless to review. Absolute quality.', img: 'https://i.pravatar.cc/80?img=33' },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="chip mb-3 mx-auto">Loved by learners</div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">People are saying wonderful things</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="card p-5"
            >
              <div className="flex items-center gap-1 text-warning">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="fill-warning" />
                ))}
              </div>
              <p className="mt-3 text-sm text-fg-muted">“{t.text}”</p>
              <div className="mt-4 flex items-center gap-3">
                <Image src={t.img} alt={t.name} width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-fg-muted">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
