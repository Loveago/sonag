'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, setTokens, clearTokens } from './api';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string | null;
};

interface AuthState {
  user: User | null;
  hydrated: boolean;
  setUser: (u: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setUser: (u) => set({ user: u }),
      login: async (email, password) => {
        const res = await api<{ user: User; accessToken: string; refreshToken: string }>(
          '/api/auth/login',
          { method: 'POST', body: JSON.stringify({ email, password }) },
        );
        setTokens(res.accessToken, res.refreshToken);
        set({ user: res.user });
        return res.user;
      },
      register: async (name, email, password) => {
        const res = await api<{ user: User; accessToken: string; refreshToken: string }>(
          '/api/auth/register',
          { method: 'POST', body: JSON.stringify({ name, email, password }) },
        );
        setTokens(res.accessToken, res.refreshToken);
        set({ user: res.user });
        return res.user;
      },
      logout: async () => {
        try {
          await api('/api/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken: localStorage.getItem('learnify.refreshToken') }),
          });
        } catch {}
        clearTokens();
        set({ user: null });
      },
      refreshMe: async () => {
        try {
          const r = await api<{ user: User }>('/api/auth/me');
          set({ user: r.user });
        } catch {
          set({ user: null });
        }
      },
    }),
    {
      name: 'learnify.user',
      partialize: (s) => ({ user: s.user }),
      onRehydrateStorage: () => (state) => { state && (state.hydrated = true); },
    },
  ),
);
