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
  occurred_at?: string
  evaluation_label?: string
}

/**
 * Data required to create a penalty.
 */
export interface PenaltyCreateData {
  student_id: string
  penalty_type_id: string
  occurred_at?: string
  evaluation_label?: string
}

/**
 * Data accepted to update a penalty.
 */
export interface PenaltyUpdateData {
  occurred_at?: string
  evaluation_label?: string
}
