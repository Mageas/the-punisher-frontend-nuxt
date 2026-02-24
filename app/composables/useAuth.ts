import type { RegisterRequest } from '~/types/api'

/**
 * Composable for managing authentication state.
 *
 * - Stores access_token in app memory state.
 * - Uses `credentials: 'include'` on $fetch so the backend's
 *   HttpOnly `refresh_token` cookie is sent/received automatically.
 * - Logout requests server-side refresh token revocation.
 */
export function useAuth() {
  const authService = useAuthService()
  const accessToken = useState<string | null>('auth.access-token', () => null)
  const isLoggingOut = useState<boolean>('auth.is-logging-out', () => false)
  const accessTokenCookie = useCookie<string | null>('access_token', {
    path: '/',
    sameSite: 'lax',
  })

  if (!accessToken.value && accessTokenCookie.value) {
    accessToken.value = accessTokenCookie.value
  }

  const isAuthenticated = computed(() => !!accessToken.value)

  function setAccessToken(token: string) {
    accessToken.value = token
    accessTokenCookie.value = token
  }

  function clearAccessToken() {
    accessToken.value = null
    accessTokenCookie.value = null
  }

  /**
   * Log in with email/password.
   * Saves the access_token in memory and lets the browser store the
   * HttpOnly refresh_token cookie set by the backend.
   */
  async function login(email: string, password: string) {
    const data = await authService.login(email, password)
    setAccessToken(data.access_token)
  }

  /**
   * Register a new teacher account.
   */
  async function register(body: RegisterRequest) {
    await authService.register(body)
  }

  /**
   * Return whether public registrations are currently allowed.
   */
  async function isRegisterAllowed() {
    const data = await authService.getRegisterStatus()
    return data.register_allowed
  }

  /**
   * Revoke the refresh_token on the server, clear local auth state and redirect to login.
   */
  async function logout() {
    isLoggingOut.value = true

    try {
      try {
        await authService.logout()
      } catch {
        // Best effort: local logout still proceeds even if server revocation fails.
      }

      clearAccessToken()
      await navigateTo('/login')
    } finally {
      isLoggingOut.value = false
    }
  }

  /**
   * Attempt to refresh the access_token using the HttpOnly refresh_token cookie.
   */
  async function refresh(): Promise<boolean> {
    try {
      const data = await authService.refresh()
      setAccessToken(data.access_token)
      return true
    } catch {
      clearAccessToken()
      return false
    }
  }

  return {
    accessToken: readonly(accessToken),
    isAuthenticated,
    login,
    register,
    isRegisterAllowed,
    logout,
    refresh,
  }
}
