import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { Bonus } from '~/types/api'
import { bonusService } from '~/services/bonus.service'
import { studentService } from '~/services/student.service'

/**
 * Composable to fetch and manage a student's bonuses with pagination.
 */
export function useStudentBonuses(studentId: MaybeRefOrGetter<string>) {
  const paginated = usePaginatedCollection<
    Bonus,
    {
      page?: number
      state?: 'used' | 'unused'
      search?: string
    }
  >((options) => studentService.getStudentBonuses(toValue(studentId), options), {
    queryKey: 'bonuses_page',
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
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchBonuses,
    gotoPage: paginated.gotoPage,
    useBonus,
    deleteBonus,
  }
}
