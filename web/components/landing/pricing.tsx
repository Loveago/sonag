'use client';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Starter',
    price: 0,
    desc: 'Get started with free courses and community access.',
    features: ['Access to free courses', 'Community support', 'Progress tracking', 'Mobile access'],
  },
  {
    name: 'Pro',
    price: 19,
    desc: 'Unlimited learning across all premium courses.',
    features: ['Everything in Starter', 'All premium courses', 'Certificates', 'Downloadable resources', 'Priority support'],
    highlight: true,
  },
  {
    name: 'Team',
    price: 49,
    desc: 'For growing teams that want to upskill together.',
    features: ['Everything in Pro', 'Team dashboard', 'Seats management', 'Analytics & reports', 'SSO (coming soon)'],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="chip mb-3 mx-auto">Pricing</div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Simple, honest pricing</h2>
          <p className="mt-3 text-fg-muted">Pick the plan that fits your goals. Cancel anytime.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={cn(
                'card relative p-6 transition',
                p.highlight && 'border-primary/50 ring-1 ring-primary/40 shadow-glow',
              )}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-fg-muted">{p.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold">${p.price}</span>
                <span className="text-sm text-fg-muted">/mo</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-primary/20 text-primary"><Check size={11} /></span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={cn('mt-6 w-full', p.highlight ? 'btn-primary' : 'btn-outline')}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
