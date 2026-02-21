import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { Punishment } from '~/types/api'
import { usePaginatedCollection } from '~/composables/usePaginatedCollection'

/**
 * Composable to fetch and manage a student's punishments with pagination.
 */
export function useStudentPunishments(studentId: MaybeRefOrGetter<string>) {
  const { $api } = useNuxtApp()
  const paginated = usePaginatedCollection<
    Punishment,
    {
      page?: number
      state?: 'pending' | 'resolved'
      search?: string
    }
  >(() => `/students/${toValue(studentId)}/punishments`)

  async function fetchPunishments(options?: {
    page?: number
    state?: 'pending' | 'resolved'
    search?: string
  }) {
    await paginated.fetchPage(options)
  }

  async function resolvePunishment(id: string) {
    await $api<Punishment>(`/punishments/${id}/resolve`, { method: 'POST' })
  }

  async function deletePunishment(id: string) {
    await $api(`/punishments/${id}`, { method: 'DELETE' })
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
