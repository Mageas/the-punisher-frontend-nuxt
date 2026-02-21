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

  const api = $fetch.create({
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

    async onResponseError({ response, options, request }) {
      // Only attempt refresh on 401 and not on auth endpoints themselves
      const resolvedRequest = await request
      const url =
        typeof resolvedRequest === 'string'
          ? resolvedRequest
          : 'url' in resolvedRequest
            ? (resolvedRequest as { url: string }).url
            : ''

      if (response.status === 401 && !url.includes('/auth/')) {
        const refreshed = await refreshToken()

        if (refreshed) {
          // Retry the original request with the new token
          const retryHeaders: Record<string, string> = {}

          if (options.headers) {
            if (options.headers instanceof Headers) {
              options.headers.forEach((value, key) => {
                retryHeaders[key] = value
              })
            } else {
              Object.assign(retryHeaders, options.headers)
            }
          }

          retryHeaders.Authorization = `Bearer ${accessToken.value}`

          // We must ensure the retry uses the full URL if we use the plain $fetch,
          // as the original request might be relative.
          const retryUrl =
            typeof resolvedRequest === 'string'
              ? resolvedRequest
              : 'url' in resolvedRequest
                ? (resolvedRequest as { url: string }).url
                : ''

          throw await $fetch(retryUrl, {
            ...options,
            baseURL: config.public.apiBaseUrl,
            method: options.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
            headers: retryHeaders,
          })
        }

        // Refresh failed — redirect to login
        accessToken.value = null
        await nuxtApp.runWithContext(() => navigateTo('/login'))
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})
