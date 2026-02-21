import type { Punishment } from '~/types/api'
/**
 * Composable to fetch and manage punishments with pagination.
 */
export function usePunishments() {
  const punishmentService = usePunishmentService()
  const paginated = usePaginatedCollection<
    Punishment,
    {
      state?: 'pending' | 'resolved'
      search?: string
    }
  >((options) => punishmentService.getPunishments(options), {
    pageKey: 'page',
    filterKeys: ['search', 'state'],
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
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPunishments,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
    resolvePunishment,
    deletePunishment,
  }
}
