import type { AuthResponse } from '~/types/api'

/**
 * Nuxt plugin that provides a global `$api` fetch instance.
 *
 * - Automatically injects the `Authorization: Bearer <token>` header.
 * - On 401 responses, attempts a silent token refresh then retries the request once.
 * - If refresh fails, clears auth state and redirects to /login.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const accessToken = useCookie('access_token', { path: '/' })

  let refreshPromise: Promise<boolean> | null = null

  /**
   * Attempt to refresh the access_token using the HttpOnly refresh_token cookie.
   * Deduplicates concurrent refresh calls.
   */
  async function refreshToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      try {
        const data = await $fetch<AuthResponse>('/auth/refresh', {
          baseURL: config.public.apiBaseUrl,
          method: 'POST',
          credentials: 'include',
        })

        accessToken.value = data.access_token
        return true
      } catch {
        accessToken.value = null
        return false
      } finally {
        refreshPromise = null
      }
    })()

    return refreshPromise
  }

  type ApiRequest = Parameters<typeof $fetch>[0]
  type ApiOptions = Parameters<typeof $fetch>[1]

  function isRequestToAuthRoute(request: ApiRequest): boolean {
    if (typeof request === 'string') {
      return request.includes('/auth/')
    }

    if (request instanceof Request) {
      return request.url.includes('/auth/')
    }

    if (request && typeof request === 'object' && 'url' in request) {
      const maybeUrl = (request as { url?: unknown }).url
      return typeof maybeUrl === 'string' && maybeUrl.includes('/auth/')
    }

    return false
  }

  function isUnauthorizedError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false

    const withStatus = error as { status?: number; response?: { status?: number } }
    return withStatus.status === 401 || withStatus.response?.status === 401
  }

  const baseApi = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',

    onRequest({ options }) {
      if (accessToken.value) {
        options.headers = options.headers || {}

        if (Array.isArray(options.headers)) {
          options.headers.push(['Authorization', `Bearer ${accessToken.value}`])
        } else if (options.headers instanceof Headers) {
          options.headers.set('Authorization', `Bearer ${accessToken.value}`)
        } else {
          ;(options.headers as Record<string, string>).Authorization = `Bearer ${accessToken.value}`
        }
      }
    },

  })

  const api = (async (request: ApiRequest, options?: ApiOptions) => {
    try {
      return await baseApi(request, options)
    } catch (error) {
      if (isUnauthorizedError(error) && !isRequestToAuthRoute(request)) {
        const refreshed = await refreshToken()

        if (refreshed) {
          return baseApi(request, options)
        }

        accessToken.value = null
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }

      throw error
    }
  }) as typeof $fetch

  return {
    provide: {
      api,
    },
  }
})
