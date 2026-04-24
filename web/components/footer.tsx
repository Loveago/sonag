'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from './logo';
import { Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/learn/')) return null;
  return (
    <footer className="border-t border-border bg-bg-subtle/50">
      <div className="container grid gap-8 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-fg-muted">
            Premium video courses on design, development and more. Learn without limits.
          </p>
          <div className="mt-4 flex gap-2">
            <SocialIcon><Twitter size={16} /></SocialIcon>
            <SocialIcon><Github size={16} /></SocialIcon>
            <SocialIcon><Linkedin size={16} /></SocialIcon>
          </div>
        </div>
        <FooterCol title="Product" links={[
          ['Courses', '/courses'],
          ['Pricing', '/#pricing'],
          ['Features', '/#features'],
        ]} />
        <FooterCol title="Company" links={[
          ['About', '/#about'],
          ['Testimonials', '/#testimonials'],
          ['Contact', '/#contact'],
        ]} />
        <FooterCol title="Legal" links={[
          ['Terms', '#'], ['Privacy', '#'], ['Refunds', '#'],
        ]} />
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-fg-muted md:flex-row">
          <p>© {new Date().getFullYear()} Learnify Inc. All rights reserved.</p>
          <p>Built with Next.js · Express · Prisma</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([l, h]) => (
          <li key={l}><Link href={h} className="text-fg-muted transition hover:text-fg">{l}</Link></li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-bg-card text-fg-muted transition hover:text-fg">
      {children}
    </span>
  );
}
