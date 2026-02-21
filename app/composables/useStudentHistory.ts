import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { StudentHistoryItem } from '~/types/api'
import { studentService } from '~/services/student.service'

/**
 * Composable to fetch and manage a student's history with pagination.
 */
export function useStudentHistory(studentId: MaybeRefOrGetter<string>) {
  const paginated = usePaginatedCollection<
    StudentHistoryItem,
    {
      page?: number
    }
  >((options) => studentService.getStudentHistory(toValue(studentId), options), {
    pageKey: 'history_page',
  })

  async function fetchHistory(options?: { page?: number }) {
    await paginated.fetchPage(options)
  }

  return {
    items: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchHistory,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
  }
}
