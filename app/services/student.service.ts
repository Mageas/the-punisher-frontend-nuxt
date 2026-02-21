import type { Student, PaginatedResponse, StudentDetail, $Fetch } from '~/types/api'

export const studentService = {
  /**
   * Fetch all students with pagination.
   */
  async getStudents($api: $Fetch, options?: { page?: number; search?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search

    return $api<PaginatedResponse<Student>>('/students', { params })
  },

  /**
   * Get a student by ID.
   */
  async getStudentById($api: $Fetch, studentId: string) {
    return $api<StudentDetail>(`/students/${studentId}`)
  },

  /**
   * Create a new student.
   */
  async createStudent($api: $Fetch, data: { first_name: string; last_name: string }) {
    return $api<Student>('/students', {
      method: 'POST',
      body: data,
    })
  },

  /**
   * Update an existing student.
   */
  async updateStudent($api: $Fetch, studentId: string, data: { first_name?: string; last_name?: string }) {
    return $api<Student>(`/students/${studentId}`, {
      method: 'PUT',
      body: data,
    })
  },

  /**
   * Delete a student.
   */
  async deleteStudent($api: $Fetch, studentId: string): Promise<void> {
    await $api(`/students/${studentId}`, {
      method: 'DELETE',
    })
  }
}
