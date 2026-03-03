import type {
  AuthResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  EmailConfirmationResendResponse,
  EmailConfirmationResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  RegisterRequest,
  RegisterStatusResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
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
   * Change current user's password.
   */
  async function changePassword(body: ChangePasswordRequest) {
    return $api<ChangePasswordResponse>('/auth/change-password', {
      method: 'POST',
      body,
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

  /**
   * Confirm a user's email from a JWT token.
   */
  async function confirmEmail(token: string) {
    return $api<EmailConfirmationResponse>('/auth/confirm-email', {
      method: 'GET',
      query: { token },
    })
  }

  /**
   * Resend a confirmation email if needed.
   */
  async function resendConfirmationEmail(email: string) {
    return $api<EmailConfirmationResendResponse>('/auth/confirm-email/resend', {
      method: 'POST',
      body: { email },
    })
  }

  /**
   * Send a neutral forgot-password request.
   */
  async function forgotPassword(email: string) {
    return $api<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: { email } as ForgotPasswordRequest,
    })
  }

  /**
   * Reset password from a password-reset token.
   */
  async function resetPassword(body: ResetPasswordRequest) {
    return $api<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body,
    })
  }

  return {
    login,
    register,
    getRegisterStatus,
    logout,
    logoutAll,
    changePassword,
    refresh,
    confirmEmail,
    resendConfirmationEmail,
    forgotPassword,
    resetPassword,
  }
}
