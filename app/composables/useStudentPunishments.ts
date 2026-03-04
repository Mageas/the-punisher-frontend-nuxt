import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { Punishment } from '~/types/api'
/**
 * Composable to fetch and manage a student's punishments with pagination.
 */
export function useStudentPunishments(studentId: MaybeRefOrGetter<string>) {
  const punishmentService = usePunishmentService()
  const studentService = useStudentService()
  const PROFILE_SECTION_PAGE_SIZE = 5
  const paginated = usePaginatedCollection<
    Punishment,
    {
      state?: 'pending' | 'resolved'
      search?: string
    }
  >(
    (options) =>
      studentService.getStudentPunishments(toValue(studentId), {
        ...options,
        item_per_page: PROFILE_SECTION_PAGE_SIZE,
      }),
    {
      pageKey: 'punishments_page',
      filterKeys: ['search', 'state'],
      defaultFilters: { state: 'pending' },
      stateKey: `paginated:student:${toValue(studentId)}:punishments`,
    },
  )

  async function fetchPunishments(options?: {
    page?: number
    state?: 'pending' | 'resolved'
    search?: string
  }) {
    await paginated.fetchPage(options)
  }

  async function resolvePunishment(id: string) {
    await punishmentService.resolvePunishment(id, {})
  }

  async function deletePunishment(id: string) {
    await punishmentService.deletePunishment(id)
  }

  return {
    punishments: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPunishments,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
    resolvePunishment,
    deletePunishment,
  }
}
