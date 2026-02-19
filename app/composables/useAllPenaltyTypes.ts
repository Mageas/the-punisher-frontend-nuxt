import type { PenaltyType } from '~/types/api'
import { useAllPaginatedCollection } from '~/composables/useAllPaginatedCollection'

/**
 * Composable to fetch ALL penalty types across all pages.
 */
export function useAllPenaltyTypes() {
  const allPaginated = useAllPaginatedCollection<PenaltyType>(() => '/penalty-types/')

  async function fetchPenaltyTypes() {
    await allPaginated.fetchAll()
  }

  return {
    penaltyTypes: allPaginated.items,
    loading: allPaginated.loading,
    fetchPenaltyTypes,
  }
}
