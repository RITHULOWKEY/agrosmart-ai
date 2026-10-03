import { startLogin } from "@/const";
import { api } from "@/lib/api";
import { useCallback, useEffect } from "react";

type UseAuthOptions = { redirectOnUnauthenticated?: boolean; redirectPath?: string };

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const meQuery = api.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const logoutMutation = api.auth.logout.useMutation();
  const utils = api.useUtils();
  const logout = useCallback(async () => { try { await logoutMutation.mutateAsync(undefined); } finally { utils.auth.me.setData(undefined, null); await utils.auth.me.invalidate(); } }, [logoutMutation, utils]);
  const user = meQuery.data ?? null;
  useEffect(() => { if (!redirectOnUnauthenticated || meQuery.isLoading || logoutMutation.isPending || user || typeof window === "undefined") return; if (redirectPath && window.location.pathname === redirectPath) return; if (redirectPath) window.location.href = redirectPath; else startLogin(); }, [redirectOnUnauthenticated, redirectPath, meQuery.isLoading, logoutMutation.isPending, user]);
  return { user, loading: meQuery.isLoading || logoutMutation.isPending, error: meQuery.error ?? logoutMutation.error ?? null, isAuthenticated: Boolean(user), refresh: () => meQuery.refetch(), logout };
}
