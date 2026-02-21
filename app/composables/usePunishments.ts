import type { Punishment } from '~/types/api'

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
  >('/punishments/')

  async function fetchPunishments(options?: {
    page?: number
    state?: 'pending' | 'resolved'
    search?: string
  }) {
    await paginated.fetchPage(options)
  }

  async function resolvePunishment(id: string) {
    await $api<Punishment>(`/punishments/${id}/resolve`, { method: 'POST' })
  }

  async function deletePunishment(id: string) {
    await $api(`/punishments/${id}`, { method: 'DELETE' })
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
