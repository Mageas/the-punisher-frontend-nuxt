/**
 * Classroom from the API.
 */
export interface Classroom {
  id: string
  name: string
  year: string
  main_teacher: string
  student_count: number
  students_preview: { id: string; first_name: string; last_name: string }[]
  total_bonus_points: number
  total_penalty_count: number
  created_at: string
  updated_at: string
}

/**
 * Alias for Classroom when used in detail routes.
 */
export type ClassroomDetail = Classroom
