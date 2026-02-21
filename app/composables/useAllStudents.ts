import type { Student } from '~/types/api'
import { studentService } from '~/services/student.service'
import { classroomService } from '~/services/classroom.service'

/**
 * Composable to fetch ALL students across all pages.
 * Optionally filtered by classroom ID.
 */
export function useAllStudents() {
  const allPaginated = useAllPaginatedCollection<Student, [string?]>((options, classroomId) => {
    if (classroomId) {
      return classroomService.getClassroomStudents(classroomId, options)
    }
    return studentService.getStudents(options)
  })

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
