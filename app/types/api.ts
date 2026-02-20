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
  automated: boolean
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
 * A student from the API.
 */
export interface Student {
  id: string
  first_name: string
  last_name: string
  classrooms: { id: string, name: string }[]
  available_bonus_points: number
  penalty_count: number
  created_at: string
  updated_at: string
}

/**
 * Student KPI counters from /students/{id}/kpis.
 */
export interface StudentKpis {
  available_bonus_points: number
  active_bonus_count: number
  total_penalty_count: number
  pending_punishment_count: number
}

/**
 * A bonus item from /students/{id}/history.
 */
export interface StudentHistoryBonusItem {
  type: 'bonus'
  id: string
  bonus_type_id: string
  bonus_type_name: string
  points: number
  used_at?: string | null
  created_at: string
}

/**
 * A penalty item from /students/{id}/history.
 */
export interface StudentHistoryPenaltyItem {
  type: 'penalty'
  id: string
  penalty_type_id: string
  penalty_type_name: string
  created_at: string
}

/**
 * A punishment item from /students/{id}/history.
 */
export interface StudentHistoryPunishmentItem {
  type: 'punishment'
  id: string
  punishment_type_id: string
  punishment_type_name: string
  automated: boolean
  triggering_rule_id?: string | null
  triggering_rule_name?: string | null
  due_at?: string | null
  resolved_at?: string | null
  created_at: string
}

/**
 * Union for student history timeline.
 */
export type StudentHistoryItem =
  | StudentHistoryBonusItem
  | StudentHistoryPenaltyItem
  | StudentHistoryPunishmentItem

/**
 * Bonus type from the API.
 */
export interface BonusType {
  id: string
  name: string
  created_at: string
  updated_at: string
}

/**
 * A bonus from the API (full resource).
 */
export interface Bonus {
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
 * Penalty type from the API.
 */
export interface PenaltyType {
  id: string
  name: string
  created_at: string
  updated_at: string
}

/**
 * A penalty from the API (full resource).
 */
export interface Penalty {
  id: string
  student_id: string
  student_first_name: string
  student_last_name: string
  penalty_type_id: string
  penalty_type_name: string
  created_at: string
}

/**
 * Punishment type from the API.
 */
export interface PunishmentType {
  id: string
  name: string
  created_at: string
  updated_at: string
}

/**
 * A punishment from the API (full resource).
 */
export interface Punishment {
  id: string
  student_id: string
  student_first_name: string
  student_last_name: string
  punishment_type_id: string
  punishment_type_name: string
  automated: boolean
  triggering_rule_id: string | null
  triggering_rule_name: string | null
  created_at: string
  due_at: string | null
  resolved_at: string | null
}

/**
 * Rule trigger mode.
 */
export type RuleMode = 'every' | 'at' | 'after'

/**
 * A rule from the API (full resource).
 */
export interface Rule {
  id: string
  name: string
  resulting_punishment_type_id: string
  resulting_punishment_type_name: string
  penalty_type_id: string
  penalty_type_name: string
  threshold: number
  due_at_after_days: number
  mode: RuleMode
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Payload used to create or update a rule.
 */
export interface RulePayload {
  name: string
  resulting_punishment_type_id: string
  penalty_type_id: string
  threshold: number
  due_at_after_days: number
  mode: RuleMode
  is_active: boolean
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
