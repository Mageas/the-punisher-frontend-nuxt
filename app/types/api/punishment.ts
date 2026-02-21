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
 * Data required to create a punishment.
 */
export interface PunishmentCreateData {
  student_id: string
  punishment_type_id: string
  due_at?: string
}

/**
 * Data required to resolve a punishment.
 */
export interface PunishmentResolveData {}
