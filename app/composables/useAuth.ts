import type { AuthResponse, LoginRequest, RegisterRequest } from '~/types/api'

/**
 * Composable for managing authentication state.
 *
 * - Persists the access_token in a cookie (accessible SSR + client).
 * - Uses `credentials: 'include'` on $fetch so the backend's
 *   HttpOnly `refresh_token` cookie is sent/received automatically.
 * - Logout clears both access_token and refresh_token cookies.
 */
export function useAuth() {
  const config = useRuntimeConfig()
  const accessToken = useCookie('access_token', { path: '/' })
  const refreshToken = useCookie('refresh_token', { path: '/v1/auth/refresh' })

  const isAuthenticated = computed(() => !!accessToken.value)

  /**
   * Log in with email/password.
   * Saves the access_token cookie and lets the browser store the
   * HttpOnly refresh_token cookie set by the backend.
   */
  async function login(email: string, password: string) {
    const data = await $fetch<AuthResponse>('/auth/login', {
      baseURL: config.public.apiBaseUrl,
      method: 'POST',
      credentials: 'include',
      body: { email, password } as LoginRequest,
    })

    accessToken.value = data.access_token
  }

  /**
   * Register a new teacher account.
   */
  async function register(body: RegisterRequest) {
    await $fetch('/auth/register', {
      baseURL: config.public.apiBaseUrl,
      method: 'POST',
      body,
    })
  }

  /**
   * Clear both access_token and refresh_token cookies, then redirect to login.
   */
  async function logout() {
    accessToken.value = null
    refreshToken.value = null
    await navigateTo('/login')
  }

  /**
   * Attempt to refresh the access_token using the HttpOnly refresh_token cookie.
   */
  async function refresh(): Promise<boolean> {
    try {
      const data = await $fetch<{ access_token: string }>('/auth/refresh', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        credentials: 'include',
      })

      accessToken.value = data.access_token
      return true
    } catch {
      accessToken.value = null
      return false
    }
  }

  return {
    accessToken: readonly(accessToken),
    isAuthenticated,
    login,
    register,
    logout,
    refresh,
  }
}
