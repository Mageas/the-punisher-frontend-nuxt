import type { Punishment } from '~/types/api'
import { punishmentService } from '~/services/punishment.service'

/**
 * Composable to fetch and manage punishments with pagination.
 */
export function usePunishments() {
  const { $api } = useNuxtApp()
  const paginated = usePaginatedCollection<
    Punishment,
    {
      page?: number
      state?: 'pending' | 'resolved'
      search?: string
    }
  >((options) => punishmentService.getPunishments($api, options))

  async function fetchPunishments(options?: {
    page?: number
    state?: 'pending' | 'resolved'
    search?: string
  }) {
    await paginated.fetchPage(options)
  }

  async function resolvePunishment(id: string) {
    await punishmentService.resolvePunishment($api, id, {})
  }

  async function deletePunishment(id: string) {
    await punishmentService.deletePunishment($api, id)
  }

  return {
    punishments: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPunishments,
    resolvePunishment,
    deletePunishment,
  }
}
