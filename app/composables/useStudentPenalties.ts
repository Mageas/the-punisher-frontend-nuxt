import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { Penalty } from '~/types/api'

/**
 * Composable to fetch and manage a student's penalties with pagination.
 */
export function useStudentPenalties(studentId: MaybeRefOrGetter<string>) {
  const { $api } = useNuxtApp()

  const paginated = usePaginatedCollection<
    Penalty,
    {
      page?: number
      search?: string
    }
  >(() => `/students/${toValue(studentId)}/penalties`)

  async function fetchPenalties(options?: { page?: number; search?: string }) {
    await paginated.fetchPage(options)
  }

  async function deletePenalty(id: string) {
    await $api(`/penalties/${id}`, { method: 'DELETE' })
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
    deletePenalty,
  }
}
