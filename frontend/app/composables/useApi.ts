import type { FetchError } from "ofetch";

type Method = "GET" | "POST" | "PUT" | "DELETE";

export function useApi() {
  const { public: config } = useRuntimeConfig();
  const { token, logout } = useAuth();

  async function request<T>(path: string, options: { method?: Method; body?: unknown } = {}) {
    try {
      return await $fetch<T>(path, {
        baseURL: config.apiBase,
        method: options.method ?? "GET",
        body: options.body as Record<string, unknown> | undefined,
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
      });
    } catch (err) {
      const fetchErr = err as FetchError;
      // token missing/expired on a protected route -> back to login
      if (fetchErr.statusCode === 401 && token.value) {
        await logout();
      }
      throw new Error(fetchErr.data?.message || fetchErr.message || "Request failed");
    }
  }

  return { request };
}
