import type { Classroom, PaginatedResponse, ClassroomDetail, Student, $Fetch } from '~/types/api'

export const classroomService = {
  async getClassrooms($api: $Fetch, options?: { page?: number; search?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Classroom>>('/classrooms', { params })
  },

  async getClassroomById($api: $Fetch, classroomId: string) {
    return $api<ClassroomDetail>(`/classrooms/${classroomId}`)
  },

  async createClassroom($api: $Fetch, data: { name: string; school_year: string }) {
    return $api<Classroom>('/classrooms', {
      method: 'POST',
      body: data,
    })
  },

  async updateClassroom($api: $Fetch, classroomId: string, data: { name?: string; school_year?: string }) {
    return $api<Classroom>(`/classrooms/${classroomId}`, {
      method: 'PUT',
      body: data,
    })
  },

  async deleteClassroom($api: $Fetch, classroomId: string): Promise<void> {
    await $api(`/classrooms/${classroomId}`, {
      method: 'DELETE',
    })
  },

  async addStudentToClassroom($api: $Fetch, classroomId: string, studentId: string): Promise<void> {
    await $api(`/classrooms/${classroomId}/students`, {
      method: 'POST',
      body: { student_id: studentId },
    })
  },

  async removeStudentFromClassroom($api: $Fetch, classroomId: string, studentId: string): Promise<void> {
    await $api(`/classrooms/${classroomId}/students/${studentId}`, {
      method: 'DELETE',
    })
  },

  async getClassroomStudents($api: $Fetch, classroomId: string, options?: { page?: number; search?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Student>>(`/classrooms/${classroomId}/students`, { params })
  }
}
