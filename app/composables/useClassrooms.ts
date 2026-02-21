import type { Classroom } from '~/types/api'

/**
 * Composable to fetch and manage classrooms with pagination.
 */
export function useClassrooms() {
  const paginated = usePaginatedCollection<
    Classroom,
    {
      page?: number
    }
  >('/classrooms/')

  async function fetchClassrooms(options?: {
    page?: number
  }) {
    await paginated.fetchPage(options)
  }

  return {
    classrooms: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchClassrooms,
  }
}
