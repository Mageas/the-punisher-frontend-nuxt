import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

type StudentBonusesFilters = {
  state?: 'used' | 'unused'
  search?: string
}

/**
 * Composable to fetch and manage a student's bonuses with pagination.
 */
export function useStudentBonuses(studentId: MaybeRefOrGetter<string>) {
  const bonusService = useBonusService()
  const studentService = useStudentService()
  const PROFILE_SECTION_PAGE_SIZE = 5
  const section = useBonusesSection<StudentBonusesFilters>({
    source: (options) =>
      studentService.getStudentBonuses(toValue(studentId), {
        ...options,
        item_per_page: PROFILE_SECTION_PAGE_SIZE,
      }),
    filterKeys: ['search', 'state'],
    filterQueryKeys: {
      search: 'bonuses_search',
      state: 'bonuses_state',
    },
    stateKey: `paginated:student:${toValue(studentId)}:bonuses`,
  })

  async function useBonus(id: string) {
    await bonusService.useBonus(id, {})
  }

  async function deleteBonus(id: string) {
    await bonusService.deleteBonus(id)
  }

  return {
    ...section,
    useBonus,
    deleteBonus,
  }
}
