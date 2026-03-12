/**
 * Authenticated user profile from /user/me.
 */
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  timezone: string
  created_at: string
  updated_at: string
}
