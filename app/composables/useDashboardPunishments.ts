import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

type DashboardPunishmentsFilters = {
  state?: 'pending' | 'resolved'
  overdue?: 'true' | 'false'
}

/**
 * Composable to fetch dashboard punishments with the same pagination model as the student profile.
 */
export function useDashboardPunishments(classroomId: MaybeRefOrGetter<string>) {
  const punishmentService = usePunishmentService()
  const DASHBOARD_SECTION_PAGE_SIZE = 5
  const section = usePunishmentsSection<DashboardPunishmentsFilters>({
    source: (options) =>
      punishmentService.getPunishments({
        ...options,
        classroom_id: toValue(classroomId) || undefined,
        item_per_page: DASHBOARD_SECTION_PAGE_SIZE,
      }),
    filterKeys: ['state', 'overdue'],
    filterQueryKeys: {
      state: 'punishments_state',
      overdue: 'punishments_overdue',
    },
    stateKey: 'paginated:dashboard:punishments',
  })

  async function resolvePunishment(id: string) {
    await punishmentService.resolvePunishment(id, {})
  }

  return {
    ...section,
    resolvePunishment,
  }
}
