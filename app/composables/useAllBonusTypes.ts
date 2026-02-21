import type { BonusType } from '~/types/api'
import { typeService } from '~/services/type.service'

/**
 * Composable to fetch ALL bonus types across all pages.
 */
export function useAllBonusTypes() {
  const allPaginated = useAllPaginatedCollection<BonusType>(($api, options) => typeService.getBonusTypes($api, options))

  async function fetchBonusTypes() {
    await allPaginated.fetchAll()
  }

  return {
    bonusTypes: allPaginated.items,
    loading: allPaginated.loading,
    fetchBonusTypes,
  }
}
