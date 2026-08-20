import { create } from 'zustand';
import type { User } from '@/types/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  /** True until the initial silent-refresh check (on app load) has resolved. */
  isBootstrapping: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  finishBootstrapping: () => void;
  clearAuth: () => void;
}

// Deliberately no `persist` middleware here — the access token lives in
// memory only, for the lifetime of the tab. A page reload loses it, which is
// why the app bootstraps by silently calling /auth/refresh on load (the
// httpOnly refresh cookie survives a reload even though this store doesn't).
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isBootstrapping: true,

  setAuth: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  finishBootstrapping: () => set({ isBootstrapping: false }),
  clearAuth: () => set({ user: null, accessToken: null }),
}));

export const useIsAuthenticated = (): boolean => useAuthStore((state) => Boolean(state.accessToken));
