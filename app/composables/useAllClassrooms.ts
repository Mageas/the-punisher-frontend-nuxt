import type { Classroom } from '~/types/api'
/**
 * Composable to fetch ALL classrooms across all pages.
 */
export function useAllClassrooms() {
  const classroomService = useClassroomService()
  const allPaginated = useAllPaginatedCollection<Classroom>((options) =>
    classroomService.getClassrooms(options),
  )

  async function fetchClassrooms() {
    await allPaginated.fetchAll()
  }

  return {
    classrooms: allPaginated.items,
    loading: allPaginated.loading,
    error: allPaginated.error,
    fetchClassrooms,
  }
}
