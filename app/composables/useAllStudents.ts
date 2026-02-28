import type { Student } from '~/types/api'
/**
 * Composable to fetch ALL students across all pages.
 * Optionally filtered by classroom ID.
 */
export function useAllStudents() {
  const studentService = useStudentService()
  const classroomService = useClassroomService()
  const allPaginated = useAllPaginatedCollection<Student, [string?]>(
    (options, classroomId) => {
      if (classroomId) {
        return classroomService.getClassroomStudents(classroomId, options)
      }
      return studentService.getStudents(options)
    },
    { stateKey: 'all:students' },
  )

  async function fetchStudents(classroomId?: string) {
    await allPaginated.fetchAll(classroomId)
  }

  return {
    students: allPaginated.items,
    loading: allPaginated.loading,
    error: allPaginated.error,
    fetchStudents,
  }
}
