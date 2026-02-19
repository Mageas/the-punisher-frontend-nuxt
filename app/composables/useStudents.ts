import type { Student } from '~/types/api'
import { usePaginatedCollection } from '~/composables/usePaginatedCollection'

/**
 * Composable to fetch and manage students with pagination.
 */
export function useStudents() {
  const paginated = usePaginatedCollection<
    Student,
    {
      page?: number
      search?: string
    }
  >('/students/')

  async function fetchStudents(options?: {
    page?: number
    search?: string
  }) {
    await paginated.fetchPage(options)
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
  }
}
