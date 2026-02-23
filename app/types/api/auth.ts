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
