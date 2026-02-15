import { parseApiError } from "@/lib/api-error"

type PrimitiveQuery = string | number | boolean | null | undefined

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  headers?: Record<string, string>
  query?: Record<string, PrimitiveQuery>
  body?: Record<string, any> | BodyInit | null
}

export function useApiClient() {
  const config = useRuntimeConfig()
  const auth = useAuth()

  const apiFetch = async <T>(path: string, options: ApiFetchOptions = {}, retry = true): Promise<T> => {
    const headers: Record<string, string> = {
      ...(options.headers ?? {}),
    }

    if (auth.accessToken.value) {
      headers.Authorization = `Bearer ${auth.accessToken.value}`
    }

    try {
      const response = await $fetch(`${config.public.apiBaseUrl}${path}`, {
        method: options.method ?? "GET",
        credentials: "include",
        headers,
        query: options.query,
        body: options.body,
      })

      return response as T
    } catch (error) {
      const parsed = parseApiError(error)

      if (retry && parsed.statusCode === 401 && !path.startsWith("/auth/")) {
        const refreshed = await auth.refresh()
        if (refreshed) {
          return await apiFetch<T>(path, options, false)
        }
      }

      throw error
    }
  }

  return { apiFetch }
}
