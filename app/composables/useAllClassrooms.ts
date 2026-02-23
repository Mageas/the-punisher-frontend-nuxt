import type { ApiRequestOptions, Classroom } from '~/types/api'
/**
 * Composable to fetch ALL classrooms across all pages.
 */
export function useAllClassrooms() {
  const classroomService = useClassroomService()
  const allPaginated = useAllPaginatedCollection<Classroom, [ApiRequestOptions | undefined]>(
    (options, requestOptions) => classroomService.getClassrooms(options, requestOptions),
  )

  async function fetchClassrooms(requestOptions?: ApiRequestOptions) {
    await allPaginated.fetchAll(requestOptions)
  }

  return {
    classrooms: allPaginated.items,
    loading: allPaginated.loading,
    error: allPaginated.error,
    fetchClassrooms,
  }
}
