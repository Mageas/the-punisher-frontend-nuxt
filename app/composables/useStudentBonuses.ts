import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { Bonus } from '~/types/api'
/**
 * Composable to fetch and manage a student's bonuses with pagination.
 */
export function useStudentBonuses(studentId: MaybeRefOrGetter<string>) {
  const bonusService = useBonusService()
  const studentService = useStudentService()
  const paginated = usePaginatedCollection<
    Bonus,
    {
      state?: 'used' | 'unused'
      search?: string
    }
  >((options) => studentService.getStudentBonuses(toValue(studentId), options), {
    pageKey: 'bonuses_page',
    filterKeys: ['search', 'state'],
    stateKey: `paginated:student:${toValue(studentId)}:bonuses`,
  })

  async function fetchBonuses(options?: {
    page?: number
    state?: 'used' | 'unused'
    search?: string
  }) {
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
