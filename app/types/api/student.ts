/**
 * A student from the API.
 */
export interface Student {
  id: string
  first_name: string
  last_name: string
  classrooms: { id: string; name: string }[]
  available_bonus_points: number
  penalty_count: number
  created_at: string
  updated_at: string
}

/**
 * Alias for Student when used in detail routes.
 */
export type StudentDetail = Student

/**
 * Student KPI counters from /students/{id}/kpis.
 */
export interface StudentKpis {
  available_bonus_points: number
  total_bonus_points: number
  active_bonus_count: number
  penalty_count: number
  total_penalty_count: number
  total_punishment_count: number
  overdue_punishment_count: number
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
 * Summary returned by a successful student import.
 */
export interface StudentImportSummary {
  rows_total: number
  rows_processed: number
  classrooms_created: number
  classrooms_existing: number
  students_created: number
  students_existing: number
  links_created: number
  links_existing: number
  rows_failed: number
}

/**
 * Successful import response.
 */
export interface StudentImportResponse {
  summary: StudentImportSummary
  errors: StudentImportRowError[]
}

/**
 * A row-level error from import validation.
 */
export interface StudentImportRowError {
  row: number
  field: string
  error: string
  value?: string
}
