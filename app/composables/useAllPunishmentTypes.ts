import type { PunishmentType } from '~/types/api'
/**
 * Composable to fetch ALL punishment types across all pages.
 */
export function useAllPunishmentTypes() {
  const typeService = useTypeService()
  const allPaginated = useAllPaginatedCollection<PunishmentType>(
    (options) => typeService.getPunishmentTypes(options),
    { stateKey: 'all:punishment-types' },
  )

  async function fetchPunishmentTypes() {
    await allPaginated.fetchAll()
  }

  return {
    punishmentTypes: allPaginated.items,
    loading: allPaginated.loading,
    error: allPaginated.error,
    fetchPunishmentTypes,
  }
}
