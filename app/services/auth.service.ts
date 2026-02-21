import type { AuthResponse, LoginRequest, RegisterRequest } from '~/types/api'

export const authService = {
  /**
   * Log in with email/password.
   */
  async login(email: string, password: string) {
    const { $api } = useNuxtApp()
    return $api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password } as LoginRequest,
    })
  },

  /**
   * Register a new teacher account.
   */
  async register(body: RegisterRequest) {
    const { $api } = useNuxtApp()
    return $api<void>('/auth/register', {
      method: 'POST',
      body,
    })
  },

  /**
   * Revoke the refresh_token on the server.
   */
  async logout() {
    const { $api } = useNuxtApp()
    return $api<void>('/auth/logout', {
      method: 'POST',
    })
  },

  /**
   * Attempt to refresh the access_token using the HttpOnly refresh_token cookie.
   */
  async refresh() {
    const { $api } = useNuxtApp()
    return $api<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
    })
  },
}
