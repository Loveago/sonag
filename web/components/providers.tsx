'use client';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '@/lib/auth-store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(
    () => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 30_000 } } }),
  );
  const refreshMe = useAuth((s) => s.refreshMe);
  const user = useAuth((s) => s.user);
  useEffect(() => {
    if (user) refreshMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={qc}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--bg-card))',
              color: 'hsl(var(--fg))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 12,
              fontSize: 14,
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
