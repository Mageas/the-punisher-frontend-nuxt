import type { Penalty } from '~/types/api'
import { penaltyService } from '~/services/penalty.service'

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
  >((options) => penaltyService.getPenalties($api, options))

  async function fetchPenalties(options?: {
    page?: number
    search?: string
  }) {
    await paginated.fetchPage(options)
  }

  async function deletePenalty(id: string) {
    await penaltyService.deletePenalty($api, id)
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
