import type { Penalty } from '~/types/api'

export type PenaltyFilters = {
  student_id?: string
  classroom_id?: string
  penalty_type_id?: string
  created_from?: string
  created_to?: string
}

/**
 * Composable to fetch and manage penalties with pagination.
 */
export function usePenalties() {
  const penaltyService = usePenaltyService()
  const paginated = usePaginatedCollection<Penalty, PenaltyFilters>(
    (options) => penaltyService.getPenalties(options),
    {
      pageKey: 'page',
      filterKeys: ['student_id', 'classroom_id', 'penalty_type_id', 'created_from', 'created_to'],
      stateKey: 'paginated:penalties',
    },
  )

  async function fetchPenalties(options?: PenaltyFilters & { page?: number }) {
    await paginated.fetchPage(options)
  }

  async function deletePenalty(id: string) {
    await penaltyService.deletePenalty(id)
  }

  return {
    penalties: paginated.items,
    loading: paginated.loading,
    error: paginated.error,
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
