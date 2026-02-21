import type { Penalty } from '~/types/api'
import { penaltyService } from '~/services/penalty.service'

/**
 * Composable to fetch and manage penalties with pagination.
 */
export function usePenalties() {
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
