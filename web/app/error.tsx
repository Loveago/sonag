'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="card max-w-md p-6 text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-fg-muted">{error.message || 'Unexpected error'}</p>
        <button onClick={reset} className="btn-primary mt-5">Try again</button>
      </div>
    </div>
  );
}
