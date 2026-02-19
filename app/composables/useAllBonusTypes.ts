import type { BonusType } from '~/types/api'
import { useAllPaginatedCollection } from '~/composables/useAllPaginatedCollection'

/**
 * Composable to fetch ALL bonus types across all pages.
 */
export function useAllBonusTypes() {
  const allPaginated = useAllPaginatedCollection<BonusType>(() => '/bonus-types/')

  async function fetchBonusTypes() {
    await allPaginated.fetchAll()
  }

  return {
    bonusTypes: allPaginated.items,
    loading: allPaginated.loading,
    fetchBonusTypes,
  }
}
