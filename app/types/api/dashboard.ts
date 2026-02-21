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
