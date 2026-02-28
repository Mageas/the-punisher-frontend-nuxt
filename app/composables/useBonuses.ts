import type { Bonus } from '~/types/api'

export type BonusFilters = {
  student_id?: string
  classroom_id?: string
  bonus_type_id?: string
  state?: 'used' | 'unused'
  created_from?: string
  created_to?: string
}

/**
 * Composable to fetch and manage bonuses with pagination.
 */
export function useBonuses() {
  const bonusService = useBonusService()
  const paginated = usePaginatedCollection<Bonus, BonusFilters>(
    (options) => bonusService.getBonuses(options),
    {
      pageKey: 'page',
      filterKeys: [
        'student_id',
        'classroom_id',
        'bonus_type_id',
        'state',
        'created_from',
        'created_to',
      ],
      stateKey: 'paginated:bonuses',
    },
  )

  async function fetchBonuses(options?: BonusFilters & { page?: number }) {
    await paginated.fetchPage(options)
  }

  async function useBonus(id: string) {
    await bonusService.useBonus(id, {})
  }

  async function deleteBonus(id: string) {
    await bonusService.deleteBonus(id)
  }

  return {
    bonuses: paginated.items,
    loading: paginated.loading,
    error: paginated.error,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchBonuses,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
    useBonus,
    deleteBonus,
  }
}
