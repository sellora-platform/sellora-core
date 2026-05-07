import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type AuthUser = {
  id: number;
  email: string;
  name: string | null;
  role: "user" | "admin";
  isVerified: boolean;
  tier: "free" | "starter" | "growth" | "scale" | "empire";
  subscriptionStatus: string;
  trialEndsAt: string | null;
};

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
};

/**
 * Sellora Auth Hook
 *
 * Manages authentication state using the /api/auth/me endpoint.
 * Replaces the Manus OAuth + tRPC auth pattern with direct REST calls.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false } = options ?? {};
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [, setLocation] = useLocation();

  // Fetch current user on mount
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (mounted) setUser(data.user);
        } else {
          if (mounted) setUser(null);
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setError(err instanceof Error ? err : new Error("Auth check failed"));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkAuth();
    return () => { mounted = false; };
  }, []);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!redirectOnUnauthenticated || loading) return;
    if (!user) {
      setLocation("/login");
    }
  }, [redirectOnUnauthenticated, loading, user, setLocation]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setLocation("/login");
    }
  }, [setLocation]);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const state = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
    }),
    [user, loading, error]
  );

  return {
    ...state,
    logout,
    refresh,
    refetch: refresh, // Alias for better compatibility
  };
}
