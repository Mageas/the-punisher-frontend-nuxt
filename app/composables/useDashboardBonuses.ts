import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

type DashboardBonusesFilters = {
  state?: 'used' | 'unused'
}

/**
 * Composable to fetch dashboard bonuses with the same pagination model as the student profile.
 */
export function useDashboardBonuses(classroomId: MaybeRefOrGetter<string>) {
  const bonusService = useBonusService()
  const DASHBOARD_SECTION_PAGE_SIZE = 5
  return useBonusesSection<DashboardBonusesFilters>({
    source: (options) =>
      bonusService.getBonuses({
        ...options,
        classroom_id: toValue(classroomId) || undefined,
        item_per_page: DASHBOARD_SECTION_PAGE_SIZE,
      }),
    filterKeys: ['state'],
    defaultFilters: { state: 'unused' },
    stateKey: 'paginated:dashboard:bonuses',
  })
}
