import type { Bonus } from '~/types/api'
import { bonusService } from '~/services/bonus.service'

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
  >((options) => bonusService.getBonuses($api, options))

  async function fetchBonuses(options?: {
    page?: number
    state?: 'used' | 'unused'
    search?: string
  }) {
    await paginated.fetchPage(options)
  }

  async function useBonus(id: string) {
    await bonusService.useBonus($api, id, {})
  }

  async function deleteBonus(id: string) {
    await bonusService.deleteBonus($api, id)
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
