import type { Penalty } from '~/types/api'

/**
 * Composable to fetch and manage penalties with pagination.
 */
export function usePenalties() {
  const { $api } = useNuxtApp()
  const paginated = usePaginatedCollection<
    Penalty,
    {
      page?: number
      search?: string
    }
  >('/penalties/')

  async function fetchPenalties(options?: {
    page?: number
    search?: string
  }) {
    await paginated.fetchPage(options)
  }

  async function deletePenalty(id: string) {
    await $api(`/penalties/${id}`, { method: 'DELETE' })
  }

  return {
    penalties: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPenalties,
    deletePenalty,
  }
}
