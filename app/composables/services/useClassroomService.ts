import type {
  ApiRequestOptions,
  Classroom,
  PaginatedResponse,
  ClassroomDetail,
  Student,
} from '~/types/api'

export function useClassroomService() {
  const { $api } = useNuxtApp()

  async function getClassrooms(
    options?: { page?: number; search?: string },
    requestOptions?: ApiRequestOptions,
  ) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Classroom>>('/classrooms', { params, ...requestOptions })
  }

  async function getClassroomById(classroomId: string) {
    return $api<ClassroomDetail>(`/classrooms/${classroomId}`)
  }

  async function createClassroom(data: { name: string; year?: string | null }) {
    return $api<Classroom>('/classrooms', {
      method: 'POST',
      body: data,
    })
  }

  async function updateClassroom(
    classroomId: string,
    data: { name?: string; year?: string | null },
  ) {
    return $api<Classroom>(`/classrooms/${classroomId}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteClassroom(classroomId: string): Promise<void> {
    await $api(`/classrooms/${classroomId}`, {
      method: 'DELETE',
    })
  }

  async function addStudentToClassroom(classroomId: string, studentId: string): Promise<void> {
    await $api(`/classrooms/${classroomId}/students`, {
      method: 'POST',
      body: { student_id: studentId },
    })
  }

  async function removeStudentFromClassroom(classroomId: string, studentId: string): Promise<void> {
    await $api(`/classrooms/${classroomId}/students/${studentId}`, {
      method: 'DELETE',
    })
  }

  async function getClassroomStudents(
    classroomId: string,
    options?: { page?: number; search?: string },
  ) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Student>>(`/classrooms/${classroomId}/students`, { params })
  }

  return {
    getClassrooms,
    getClassroomById,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    addStudentToClassroom,
    removeStudentFromClassroom,
    getClassroomStudents,
  }
}
