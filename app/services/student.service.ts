import type { Student, PaginatedResponse, StudentDetail } from '~/types/api'

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
