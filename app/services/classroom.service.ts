import type { Classroom, PaginatedResponse, ClassroomDetail, Student } from '~/types/api'

export const classroomService = {
  async getClassrooms(options?: { page?: number; search?: string }) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Classroom>>('/classrooms', { params })
  },

  async getClassroomById(classroomId: string) {
    const { $api } = useNuxtApp()
    return $api<ClassroomDetail>(`/classrooms/${classroomId}`)
  },

  async createClassroom(data: { name: string; school_year: string }) {
    const { $api } = useNuxtApp()
    return $api<Classroom>('/classrooms', {
      method: 'POST',
      body: data,
    })
  },

  async updateClassroom(classroomId: string, data: { name?: string; school_year?: string }) {
    const { $api } = useNuxtApp()
    return $api<Classroom>(`/classrooms/${classroomId}`, {
      method: 'PUT',
      body: data,
    })
  },

  async deleteClassroom(classroomId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/classrooms/${classroomId}`, {
      method: 'DELETE',
    })
  },

  async addStudentToClassroom(classroomId: string, studentId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/classrooms/${classroomId}/students`, {
      method: 'POST',
      body: { student_id: studentId },
    })
  },

  async removeStudentFromClassroom(classroomId: string, studentId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/classrooms/${classroomId}/students/${studentId}`, {
      method: 'DELETE',
    })
  },

  async getClassroomStudents(classroomId: string, options?: { page?: number; search?: string }) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Student>>(`/classrooms/${classroomId}/students`, { params })
  },
}
