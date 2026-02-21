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

export const studentService = {
  /**
   * Fetch all students with pagination.
   */
  async getStudents(options?: { page?: number; search?: string }) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search

    return $api<PaginatedResponse<Student>>('/students', { params })
  },

  /**
   * Get a student by ID.
   */
  async getStudentById(studentId: string) {
    const { $api } = useNuxtApp()
    return $api<StudentDetail>(`/students/${studentId}`)
  },

  /**
   * Get KPI counters for a student.
   */
  async getStudentKpis(studentId: string) {
    const { $api } = useNuxtApp()
    return $api<StudentKpis>(`/students/${studentId}/kpis`)
  },

  /**
   * Get bonuses for a student with pagination.
   */
  async getStudentBonuses(
    studentId: string,
    options?: { page?: number; state?: string; search?: string },
  ) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.state) params.state = options.state
    if (options?.search) params.search = options.search

    return $api<PaginatedResponse<Bonus>>(`/students/${studentId}/bonuses`, { params })
  },

  /**
   * Get penalties for a student with pagination.
   */
  async getStudentPenalties(studentId: string, options?: { page?: number; search?: string }) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search

    return $api<PaginatedResponse<Penalty>>(`/students/${studentId}/penalties`, { params })
  },

  /**
   * Get punishments for a student with pagination.
   */
  async getStudentPunishments(
    studentId: string,
    options?: { page?: number; state?: string; search?: string },
  ) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.state) params.state = options.state
    if (options?.search) params.search = options.search

    return $api<PaginatedResponse<Punishment>>(`/students/${studentId}/punishments`, { params })
  },

  /**
   * Get history timeline for a student.
   */
  async getStudentHistory(studentId: string, options?: { page?: number }) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page

    return $api<PaginatedResponse<StudentHistoryItem>>(`/students/${studentId}/history`, {
      params,
    })
  },

  /**
   * Create a new student.
   */
  async createStudent(data: { first_name: string; last_name: string }) {
    const { $api } = useNuxtApp()
    return $api<Student>('/students', {
      method: 'POST',
      body: data,
    })
  },

  /**
   * Update an existing student.
   */
  async updateStudent(studentId: string, data: { first_name?: string; last_name?: string }) {
    const { $api } = useNuxtApp()
    return $api<Student>(`/students/${studentId}`, {
      method: 'PUT',
      body: data,
    })
  },

  /**
   * Delete a student.
   */
  async deleteStudent(studentId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/students/${studentId}`, {
      method: 'DELETE',
    })
  },
}
