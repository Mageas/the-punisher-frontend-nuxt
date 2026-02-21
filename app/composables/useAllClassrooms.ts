import type { Classroom } from '~/types/api'
import { classroomService } from '~/services/classroom.service'

/**
 * Composable to fetch ALL classrooms across all pages.
 */
export function useAllClassrooms() {
  const allPaginated = useAllPaginatedCollection<Classroom>((options) =>
    classroomService.getClassrooms(options),
  )

  async function fetchClassrooms() {
    await allPaginated.fetchAll()
  }

  return {
    classrooms: allPaginated.items,
    loading: allPaginated.loading,
    fetchClassrooms,
  }
}
