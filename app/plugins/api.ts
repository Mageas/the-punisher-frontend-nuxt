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
  const accessToken = useState<string | null>('auth.access-token', () => null)
  const accessTokenCookie = useCookie<string | null>('access_token', {
    path: '/',
    sameSite: 'lax',
  })

  if (!accessToken.value && accessTokenCookie.value) {
    accessToken.value = accessTokenCookie.value
  }

  let refreshPromise: Promise<boolean> | null = null

  function setAccessToken(token: string) {
    accessToken.value = token
    accessTokenCookie.value = token
  }

  function clearAccessToken() {
    accessToken.value = null
    accessTokenCookie.value = null
  }

  /**
   * Attempt to refresh the access_token using the HttpOnly refresh_token cookie.
   * Deduplicates concurrent refresh calls.
   */
  async function refreshToken(): Promise<boolean> {
    if (import.meta.server) {
      return false
    }

    if (refreshPromise) return refreshPromise

    refreshPromise = (async () => {
      try {
        const data = await $fetch<AuthResponse>('/auth/refresh', {
          baseURL: config.public.apiBaseUrl,
          method: 'POST',
          credentials: 'include',
        })

        setAccessToken(data.access_token)
        return true
      } catch {
        clearAccessToken()
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
        if (accessTokenCookie.value !== accessToken.value) {
          accessTokenCookie.value = accessToken.value
        }

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

  const api = (async (request: ApiRequest, options?: ApiOptions & { fatal?: boolean }) => {
    try {
      return await baseApi(request, options)
    } catch (error: unknown) {
      // 1. Handle 401 Unauthorized (Silent Token Refresh)
      if (isUnauthorizedError(error) && !isRequestToAuthRoute(request)) {
        if (import.meta.server) {
          clearAccessToken()
          throw error
        }

        const refreshed = await refreshToken()

        if (refreshed) {
          return baseApi(request, options)
        }

        clearAccessToken()
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }

      // 2. Handle Fatal Errors (500+, Network Failure)
      // If the error is 500 or higher, or has no statusCode (connection refused),
      // we throw a fatal error that Nuxt captures to show the error page.
      // We skip this if options.fatal is explicitly false.
      if (error && typeof error === 'object') {
        const e = error as { statusCode?: number; status?: number; statusMessage?: string }
        const statusCode = e.statusCode || e.status || 500
        const isFatalError = statusCode >= 500 || e.statusCode === undefined

        if (isFatalError && options?.fatal !== false) {
          throw createError({
            statusCode: statusCode,
            statusMessage: e.statusMessage || 'Internal Server Error',
            fatal: true,
          })
        }
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
