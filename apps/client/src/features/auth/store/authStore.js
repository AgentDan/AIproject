import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Auth store: user + JWT for protected API routes.
 * user: { id, nickname, role } | null
 */
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: ({ user, token }) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null })
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token })
    }
  )
);
