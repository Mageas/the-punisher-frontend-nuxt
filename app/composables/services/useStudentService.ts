import type {
  Student,
  PaginatedResponse,
  StudentDetail,
  StudentKpis,
  Bonus,
  Penalty,
  Punishment,
  StudentHistoryItem,
} from '~/types/api'

export function useStudentService() {
  const { $api } = useNuxtApp()

  /**
   * Fetch all students with pagination.
   */
  async function getStudents(options?: { page?: number; search?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search

    return $api<PaginatedResponse<Student>>('/students', { params })
  }

  /**
   * Get a student by ID.
   */
  async function getStudentById(studentId: string) {
    return $api<StudentDetail>(`/students/${studentId}`)
  }

  /**
   * Get KPI counters for a student.
   */
  async function getStudentKpis(studentId: string) {
    return $api<StudentKpis>(`/students/${studentId}/kpis`)
  }

  /**
   * Get bonuses for a student with pagination.
   */
  async function getStudentBonuses(
    studentId: string,
    options?: { page?: number; state?: string; search?: string },
  ) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.state) params.state = options.state
    if (options?.search) params.search = options.search

    return $api<PaginatedResponse<Bonus>>(`/students/${studentId}/bonuses`, { params })
  }

  /**
   * Get penalties for a student with pagination.
   */
  async function getStudentPenalties(
    studentId: string,
    options?: { page?: number; search?: string },
  ) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search

    return $api<PaginatedResponse<Penalty>>(`/students/${studentId}/penalties`, { params })
  }

  /**
   * Get punishments for a student with pagination.
   */
  async function getStudentPunishments(
    studentId: string,
    options?: { page?: number; state?: string; search?: string },
  ) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.state) params.state = options.state
    if (options?.search) params.search = options.search

    return $api<PaginatedResponse<Punishment>>(`/students/${studentId}/punishments`, { params })
  }

  /**
   * Get history timeline for a student.
   */
  async function getStudentHistory(studentId: string, options?: { page?: number }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page

    return $api<PaginatedResponse<StudentHistoryItem>>(`/students/${studentId}/history`, {
      params,
    })
  }

  /**
   * Create a new student.
   */
  async function createStudent(data: { first_name: string; last_name: string }) {
    return $api<Student>('/students', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Update an existing student.
   */
  async function updateStudent(
    studentId: string,
    data: { first_name?: string; last_name?: string },
  ) {
    return $api<Student>(`/students/${studentId}`, {
      method: 'PUT',
      body: data,
    })
  }

  /**
   * Delete a student.
   */
  async function deleteStudent(studentId: string): Promise<void> {
    await $api(`/students/${studentId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Delete all students.
   */
  async function deleteAllStudents(): Promise<void> {
    await $api('/students', {
      method: 'DELETE',
    })
  }

  return {
    getStudents,
    getStudentById,
    getStudentKpis,
    getStudentBonuses,
    getStudentPenalties,
    getStudentPunishments,
    getStudentHistory,
    createStudent,
    updateStudent,
    deleteStudent,
    deleteAllStudents,
  }
}
