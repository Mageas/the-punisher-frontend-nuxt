import type { Student } from '~/types/api'
/**
 * Composable to fetch and manage students with pagination.
 */
export function useStudents() {
  const studentService = useStudentService()
  const paginated = usePaginatedCollection<
    Student,
    {
      search?: string
    }
  >((options) => studentService.getStudents(options), {
    pageKey: 'page',
    filterKeys: ['search'],
  })

  async function fetchStudents(options?: { page?: number; search?: string }) {
    await paginated.fetchPage(options)
  }

  async function createStudent(data: { first_name: string; last_name: string }) {
    return await studentService.createStudent(data)
  }

  async function updateStudent(
    studentId: string,
    data: { first_name?: string; last_name?: string },
  ) {
    return await studentService.updateStudent(studentId, data)
  }

  async function deleteStudent(studentId: string) {
    return await studentService.deleteStudent(studentId)
  }

  return {
    students: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchStudents,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
    createStudent,
    updateStudent,
    deleteStudent,
  }
}
