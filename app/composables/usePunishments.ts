import type { Punishment } from '~/types/api'
import { punishmentService } from '~/services/punishment.service'

/**
 * Composable to fetch and manage punishments with pagination.
 */
export function usePunishments() {
  const paginated = usePaginatedCollection<
    Punishment,
    {
      page?: number
      state?: 'pending' | 'resolved'
      search?: string
    }
  >((options) => punishmentService.getPunishments(options), {
    queryKey: 'page',
    searchKey: 'search',
  })

  async function fetchPunishments(options?: {
    page?: number
    state?: 'pending' | 'resolved'
    search?: string
  }) {
    await paginated.fetchPage(options)
  }

  async function resolvePunishment(id: string) {
    await punishmentService.resolvePunishment(id, {})
  }

  async function deletePunishment(id: string) {
    await punishmentService.deletePunishment(id)
  }

  return {
    punishments: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    search: paginated.search,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPunishments,
    gotoPage: paginated.gotoPage,
    applySearch: paginated.applySearch,
    resolvePunishment,
    deletePunishment,
  }
}
