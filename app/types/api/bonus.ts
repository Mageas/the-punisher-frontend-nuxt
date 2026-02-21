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
