import type { Bonus } from '~/types/api'

/**
 * Composable to fetch and manage bonuses with pagination.
 */
export function useBonuses() {
  const { $api } = useNuxtApp()
  const paginated = usePaginatedCollection<
    Bonus,
    {
      page?: number
      state?: 'used' | 'unused'
      search?: string
    }
  >('/bonuses/')

  async function fetchBonuses(options?: {
    page?: number
    state?: 'used' | 'unused'
    search?: string
  }) {
    await paginated.fetchPage(options)
  }

  async function useBonus(id: string) {
    await $api<Bonus>(`/bonuses/${id}/use`, { method: 'POST' })
  }

  async function deleteBonus(id: string) {
    await $api(`/bonuses/${id}`, { method: 'DELETE' })
  }

  return {
    bonuses: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchBonuses,
    useBonus,
    deleteBonus,
  }
}
