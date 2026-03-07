/**
 * Rule trigger mode.
 */
export type RuleMode = 'every' | 'at' | 'after'

/**
 * Rule due date computation mode.
 */
export type RuleDueAtMode = 'days' | 'next_lessons'

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
  due_at_mode: RuleDueAtMode
  due_at_after_days: number | null
  due_at_after_lessons: number | null
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
  due_at_mode: RuleDueAtMode
  due_at_after_days: number | null
  due_at_after_lessons: number | null
  mode: RuleMode
  is_active: boolean
}
