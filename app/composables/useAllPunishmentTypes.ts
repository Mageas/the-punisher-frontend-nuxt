import type { PunishmentType } from '~/types/api'
import { typeService } from '~/services/type.service'

/**
 * Composable to fetch ALL punishment types across all pages.
 */
export function useAllPunishmentTypes() {
  const allPaginated = useAllPaginatedCollection<PunishmentType>(($api, options) => typeService.getPunishmentTypes($api, options))

  async function fetchPunishmentTypes() {
    await allPaginated.fetchAll()
  }

  return {
    punishmentTypes: allPaginated.items,
    loading: allPaginated.loading,
    fetchPunishmentTypes,
  }
}
