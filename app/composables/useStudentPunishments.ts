import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { Punishment } from '~/types/api'
import { punishmentService } from '~/services/punishment.service'
import { studentService } from '~/services/student.service'

/**
 * Composable to fetch and manage a student's punishments with pagination.
 */
export function useStudentPunishments(studentId: MaybeRefOrGetter<string>) {
  const paginated = usePaginatedCollection<
    Punishment,
    {
      page?: number
      state?: 'pending' | 'resolved'
      search?: string
    }
  >((options) => studentService.getStudentPunishments(toValue(studentId), options))

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
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPunishments,
    resolvePunishment,
    deletePunishment,
  }
}
