import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { Penalty } from '~/types/api'
/**
 * Composable to fetch and manage a student's penalties with pagination.
 */
export function useStudentPenalties(studentId: MaybeRefOrGetter<string>) {
  const studentService = useStudentService()
  const penaltyService = usePenaltyService()
  const paginated = usePaginatedCollection<
    Penalty,
    {
      search?: string
    }
  >((options) => studentService.getStudentPenalties(toValue(studentId), options), {
    pageKey: 'penalties_page',
    filterKeys: ['search'],
  })

  async function fetchPenalties(options?: { page?: number; search?: string }) {
    await paginated.fetchPage(options)
  }

  async function deletePenalty(id: string) {
    await penaltyService.deletePenalty(id)
  }

  return {
    penalties: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPenalties,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
    deletePenalty,
  }
}
