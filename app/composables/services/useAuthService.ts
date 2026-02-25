import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterStatusResponse,
} from '~/types/api'

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
   * Read registration availability flag.
   */
  async function getRegisterStatus() {
    return $api<RegisterStatusResponse>('/auth/register/status', {
      method: 'GET',
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
   * Revoke all refresh tokens for the current user on the server.
   */
  async function logoutAll() {
    return $api<unknown>('/auth/refresh-tokens', {
      method: 'DELETE',
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
    getRegisterStatus,
    logout,
    logoutAll,
    refresh,
  }
}
