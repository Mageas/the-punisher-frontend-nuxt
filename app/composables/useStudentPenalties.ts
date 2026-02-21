import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { Penalty } from '~/types/api'
import { studentService } from '~/services/student.service'
import { penaltyService } from '~/services/penalty.service'

/**
 * Composable to fetch and manage a student's penalties with pagination.
 */
export function useStudentPenalties(studentId: MaybeRefOrGetter<string>) {
  const paginated = usePaginatedCollection<
    Penalty,
    {
      page?: number
      search?: string
    }
  >((options) => studentService.getStudentPenalties(toValue(studentId), options), {
    queryKey: 'penalties_page',
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
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPenalties,
    gotoPage: paginated.gotoPage,
    deletePenalty,
  }
}
