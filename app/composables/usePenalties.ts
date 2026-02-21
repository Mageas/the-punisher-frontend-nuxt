import type { Penalty } from '~/types/api'
/**
 * Composable to fetch and manage penalties with pagination.
 */
export function usePenalties() {
  const penaltyService = usePenaltyService()
  const paginated = usePaginatedCollection<
    Penalty,
    {
      search?: string
    }
  >((options) => penaltyService.getPenalties(options), {
    pageKey: 'page',
    filterKeys: ['search'],
  })

  async function fetchPenalties(options?: { page?: number; search?: string }) {
    await paginated.fetchPage(options)
  }

  async function deletePenalty(id: string) {
    await penaltyService.deletePenalty(id)
  }

  return {
    penalties: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPenalties,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
    deletePenalty,
  }
}
