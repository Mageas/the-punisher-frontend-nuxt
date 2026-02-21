import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { StudentHistoryItem } from '~/types/api'

/**
 * Composable to fetch and manage a student's history with pagination.
 */
export function useStudentHistory(studentId: MaybeRefOrGetter<string>) {
  const paginated = usePaginatedCollection<
    StudentHistoryItem,
    {
      page?: number
    }
  >(() => `/students/${toValue(studentId)}/history`)

  async function fetchHistory(options?: { page?: number }) {
    await paginated.fetchPage(options)
  }

  return {
    items: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchHistory,
  }
}
