'use client';
import { ShieldCheck } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-fg-muted">Platform configuration.</p>
      <div className="card mt-6 p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary"><ShieldCheck size={20} /></div>
          <div>
            <div className="font-medium">Platform Security</div>
            <div className="text-sm text-fg-muted">JWT rotation is enabled, rate-limits active on auth.</div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Row label="Database" value="PostgreSQL (Prisma)" />
          <Row label="Storage" value="AWS S3 (signed URLs)" />
          <Row label="Auth" value="JWT + Refresh rotation" />
          <Row label="Payments" value="Stripe (placeholder)" />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-subtle p-3">
      <div className="text-xs uppercase tracking-wider text-fg-muted">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
