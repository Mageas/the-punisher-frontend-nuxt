import type { AuthResponse, LoginRequest, RegisterRequest } from '~/types/api'

export function useAuthService() {
  const { $api } = useNuxtApp()

  /**
   * Log in with email/password.
   */
  async function login(email: string, password: string) {
    return $api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password } as LoginRequest,
    })
  }

  /**
   * Register a new teacher account.
   */
  async function register(body: RegisterRequest) {
    return $api<unknown>('/auth/register', {
      method: 'POST',
      body,
    })
  }

  /**
   * Revoke the refresh_token on the server.
   */
  async function logout() {
    return $api<unknown>('/auth/logout', {
      method: 'POST',
    })
  }

  /**
   * Attempt to refresh the access_token using the HttpOnly refresh_token cookie.
   */
  async function refresh() {
    return $api<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
    })
  }

  return {
    login,
    register,
    logout,
    refresh,
  }
}
