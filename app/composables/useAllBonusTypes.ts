import type { BonusType } from '~/types/api'
/**
 * Composable to fetch ALL bonus types across all pages.
 */
export function useAllBonusTypes() {
  const typeService = useTypeService()
  const allPaginated = useAllPaginatedCollection<BonusType>((options) =>
    typeService.getBonusTypes(options),
  )

  async function fetchBonusTypes() {
    await allPaginated.fetchAll()
  }

  return {
    bonusTypes: allPaginated.items,
    loading: allPaginated.loading,
    error: allPaginated.error,
    fetchBonusTypes,
  }
}
