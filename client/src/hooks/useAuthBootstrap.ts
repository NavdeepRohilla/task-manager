import { useEffect } from 'react';
import { authApi } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

/**
 * Runs once on app load. The access token lives only in memory, but the
 * refresh token survives as an httpOnly cookie — so on a fresh page load we
 * try to silently trade that cookie for a new access token before deciding
 * the user is actually logged out. A missing/expired cookie just resolves
 * to "logged out", not an error.
 */
export function useAuthBootstrap(): void {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { accessToken } = await authApi.refresh();
        useAuthStore.getState().setAccessToken(accessToken);
        const user = await authApi.me();
        if (!cancelled) {
          useAuthStore.getState().setAuth(user, accessToken);
        }
      } catch {
        // No valid refresh cookie — a normal logged-out state on first visit.
      } finally {
        if (!cancelled) {
          useAuthStore.getState().finishBootstrapping();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
