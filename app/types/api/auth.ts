/**
 * Request payload for login.
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Response for a successful login or token refresh.
 */
export interface AuthResponse {
  access_token: string
}

/**
 * Request payload for password change.
 */
export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  confirm_password: string
}

/**
 * Response for a successful password change.
 */
export interface ChangePasswordResponse {
  status: 'password_changed'
}

/**
 * Response for public registration availability.
 */
export interface RegisterStatusResponse {
  register_allowed: boolean
}

/**
 * Request payload for registration.
 */
export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
}

/**
 * Response for a successful email confirmation action.
 */
export interface EmailConfirmationResponse {
  status: 'email_confirmed'
}

/**
 * Response for a successful email confirmation resend action.
 */
export interface EmailConfirmationResendResponse {
  status: 'confirmation_email_sent_if_needed'
}
