import type { PenaltyType } from '~/types/api'
import { typeService } from '~/services/type.service'

/**
 * Composable to fetch ALL penalty types across all pages.
 */
export function useAllPenaltyTypes() {
  const allPaginated = useAllPaginatedCollection<PenaltyType>((options) =>
    typeService.getPenaltyTypes(options),
  )

  async function fetchPenaltyTypes() {
    await allPaginated.fetchAll()
  }

  return {
    penaltyTypes: allPaginated.items,
    loading: allPaginated.loading,
    error: allPaginated.error,
    fetchPenaltyTypes,
  }
}
