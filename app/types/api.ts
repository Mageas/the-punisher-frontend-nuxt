/**
 * Standard API error response from the backend.
 */
export interface ApiError {
  error: string
  error_code: number
  error_details?: ApiErrorDetail[]
}

/**
 * A single field-level validation error detail.
 * The `error` field can be a simple key like "validation_field_required"
 * or a key with a value like "validation_min_length:8".
 */
export interface ApiErrorDetail {
  field: string
  error: string
}

/**
 * Paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  page: number
  item_per_page: number
  total_count: number
  previous_page: number | null
  next_page: number | null
  data: T[]
}

/**
 * Dashboard KPIs.
 */
export interface DashboardKpis {
  student_count: number
  available_bonus_points: number
  unused_bonus_count: number
  penalty_count: number
  pending_punishment_count: number
}

/**
 * A recent penalty entry from the dashboard.
 */
export interface DashboardPenalty {
  id: string
  student_id: string
  student_first_name: string
  student_last_name: string
  penalty_type_id: string
  penalty_type_name: string
  created_at: string
}

/**
 * A recent bonus entry from the dashboard.
 */
export interface DashboardBonus {
  id: string
  student_id: string
  student_first_name: string
  student_last_name: string
  bonus_type_id: string
  bonus_type_name: string
  points: number
  created_at: string
  used_at: string | null
}

/**
 * A pending punishment entry from the dashboard.
 */
export interface DashboardPunishment {
  id: string
  student_id: string
  student_first_name: string
  student_last_name: string
  punishment_type_id: string
  punishment_type_name: string
  triggering_rule_id: string | null
  triggering_rule_name: string | null
  created_at: string
  due_at: string | null
  resolved_at: string | null
}

/**
 * Full dashboard API response.
 */
export interface DashboardResponse {
  kpis: DashboardKpis
  recent_penalties: DashboardPenalty[]
  recent_bonuses: DashboardBonus[]
  pending_punishments: DashboardPunishment[]
}

/**
 * Authenticated user profile from /user/me.
 */
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  created_at: string
  updated_at: string
}

/**
 * Classroom from the API.
 */
export interface Classroom {
  id: string
  name: string
  year: string
  main_teacher: string
  student_count: number
  students_preview: { id: string, first_name: string, last_name: string }[]
  total_bonus_points: number
  total_penalty_count: number
  created_at: string
  updated_at: string
}
