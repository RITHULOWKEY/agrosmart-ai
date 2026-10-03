import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";

type ApiError = Error & { status?: number };
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, ...init });
  const body = await response.json().catch(() => null);
  if (!response.ok) { const error = new Error(body?.message || "Request failed.") as ApiError; error.status = response.status; throw error; }
  return body as T;
}
const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) });
const patch = <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
const del = <T>(path: string) => request<T>(path, { method: "DELETE" });

export function useApiQuery<T>(key: unknown[], path: string, options?: Omit<UseQueryOptions<T, ApiError>, "queryKey" | "queryFn">) { return useQuery<T, ApiError>({ queryKey: key, queryFn: () => get<T>(path), ...options }); }
export function useApiMutation<T, I>(fn: (input: I) => Promise<T>, options?: UseMutationOptions<T, ApiError, I>) { return useMutation<T, ApiError, I>({ mutationFn: fn, ...options }); }

export const api = {
  auth: {
    me: { useQuery: (_input?: unknown, options?: any) => useApiQuery<any | null>(["auth", "me"], "/auth/me", options),
      setData: undefined as unknown as (data: any) => void },
    login: { useMutation: (options?: any) => useApiMutation<any, { email: string; password: string }>((input) => post("/auth/login", input), options) },
    register: { useMutation: (options?: any) => useApiMutation<any, { name: string; email: string; password: string; confirmPassword: string }>((input) => post("/auth/register", input), options) },
    logout: { useMutation: (options?: any) => useApiMutation<{ success: boolean }, undefined>(() => post("/auth/logout", {}), options) },
  },
  profile: { update: { useMutation: (options?: any) => useApiMutation<any, { name: string; preferredLanguage: "English" | "Tamil" }>((input) => patch("/profile", input), options) } },
  analysis: {
    create: { useMutation: (options?: any) => useApiMutation<any, Record<string, unknown>>((input) => post("/analysis", input), options) },
    list: { useQuery: (options?: any) => useApiQuery<any[]>(["analysis", "list"], "/analysis/history", options) },
    get: { useQuery: (input: { id: string }, options?: any) => useApiQuery<any>(["analysis", input.id], `/analysis/${encodeURIComponent(input.id)}`, { enabled: Boolean(input.id), ...options }) },
  },
  gallery: {
    list: { useQuery: (input?: { search?: string; category?: string }, options?: any) => { const params = new URLSearchParams(); if (input?.search) params.set("search", input.search); if (input?.category) params.set("category", input.category); return useApiQuery<any[]>(["gallery", input], `/gallery${params.toString() ? `?${params}` : ""}`, options); } },
    create: { useMutation: (options?: any) => useApiMutation<any, Record<string, unknown>>((input) => post("/gallery", input), options) },
    remove: { useMutation: (options?: any) => useApiMutation<{ success: boolean }, { id: string | number }>((input) => del(`/gallery/${encodeURIComponent(String(input.id))}`), options) },
  },
  intake: { submitContact: { useMutation: (options?: any) => useApiMutation<{ success: boolean }, Record<string, unknown>>((input) => post("/contact", input), options) } },
  useUtils: () => { const queryClient = useQueryClient(); return { auth: { me: { setData: (_input: unknown, data: any) => queryClient.setQueryData(["auth", "me"], data), invalidate: () => queryClient.invalidateQueries({ queryKey: ["auth", "me"] }) } }, gallery: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ["gallery"] }) } }, analysis: { list: { invalidate: () => queryClient.invalidateQueries({ queryKey: ["analysis", "list"] }) } } }; },
};
