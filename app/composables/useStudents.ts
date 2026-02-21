import type { Student } from '~/types/api'
import { studentService } from '~/services/student.service'

/**
 * Composable to fetch and manage students with pagination.
 */
export function useStudents() {
  const { $api } = useNuxtApp()

  const paginated = usePaginatedCollection<
    Student,
    {
      page?: number
      search?: string
    }
  >((options) => studentService.getStudents($api, options))

  async function fetchStudents(options?: {
    page?: number
    search?: string
  }) {
    await paginated.fetchPage(options)
  }

  async function createStudent(data: { first_name: string; last_name: string }) {
    return await studentService.createStudent($api, data)
  }

  async function updateStudent(studentId: string, data: { first_name?: string; last_name?: string }) {
    return await studentService.updateStudent($api, studentId, data)
  }

  async function deleteStudent(studentId: string) {
    return await studentService.deleteStudent($api, studentId)
  }

  return {
    students: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  }
}
