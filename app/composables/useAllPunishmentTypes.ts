import type { PunishmentType } from '~/types/api'

/**
 * Composable to fetch ALL punishment types across all pages.
 */
export function useAllPunishmentTypes() {
  const allPaginated = useAllPaginatedCollection<PunishmentType>(() => '/punishment-types/')

  async function fetchPunishmentTypes() {
    await allPaginated.fetchAll()
  }

  return {
    punishmentTypes: allPaginated.items,
    loading: allPaginated.loading,
    fetchPunishmentTypes,
  }
}
