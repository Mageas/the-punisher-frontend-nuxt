import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

type DashboardPenaltiesFilters = Record<never, never>

/**
 * Composable to fetch dashboard penalties with the same pagination model as the student profile.
 */
export function useDashboardPenalties(classroomId: MaybeRefOrGetter<string>) {
  const penaltyService = usePenaltyService()
  const DASHBOARD_SECTION_PAGE_SIZE = 5
  return usePenaltiesSection<DashboardPenaltiesFilters>({
    source: (options) =>
      penaltyService.getPenalties({
        ...options,
        classroom_id: toValue(classroomId) || undefined,
        item_per_page: DASHBOARD_SECTION_PAGE_SIZE,
      }),
    filterKeys: [],
    stateKey: 'paginated:dashboard:penalties',
  })
}
