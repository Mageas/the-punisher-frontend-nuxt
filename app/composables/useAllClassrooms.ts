import type { Classroom } from '~/types/api'
import { useAllPaginatedCollection } from '~/composables/useAllPaginatedCollection'

/**
 * Composable to fetch ALL classrooms across all pages.
 */
export function useAllClassrooms() {
  const allPaginated = useAllPaginatedCollection<Classroom>(() => '/classrooms/')

  async function fetchClassrooms() {
    await allPaginated.fetchAll()
  }

  return {
    classrooms: allPaginated.items,
    loading: allPaginated.loading,
    fetchClassrooms,
  }
}
