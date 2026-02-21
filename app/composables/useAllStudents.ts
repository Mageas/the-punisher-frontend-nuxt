import type { Student } from '~/types/api'

/**
 * Composable to fetch ALL students across all pages.
 * Optionally filtered by classroom ID.
 */
export function useAllStudents() {
  const allPaginated = useAllPaginatedCollection<Student, [string?]>((classroomId?: string) => {
    return classroomId ? `/classrooms/${classroomId}/students` : '/students/'
  })

  async function fetchStudents(classroomId?: string) {
    await allPaginated.fetchAll(classroomId)
  }

  return {
    students: allPaginated.items,
    loading: allPaginated.loading,
    fetchStudents,
  }
}
