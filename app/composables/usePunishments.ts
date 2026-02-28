import type { Punishment } from '~/types/api'

export type PunishmentFilters = {
  student_id?: string
  classroom_id?: string
  punishment_type_id?: string
  state?: 'pending' | 'resolved'
  automated?: string
  overdue?: string
  created_from?: string
  created_to?: string
  due_from?: string
  due_to?: string
}

/**
 * Composable to fetch and manage punishments with pagination.
 */
export function usePunishments() {
  const punishmentService = usePunishmentService()
  const paginated = usePaginatedCollection<Punishment, PunishmentFilters>(
    (options) => punishmentService.getPunishments(options),
    {
      pageKey: 'page',
      filterKeys: [
        'student_id',
        'classroom_id',
        'punishment_type_id',
        'state',
        'automated',
        'overdue',
        'created_from',
        'created_to',
        'due_from',
        'due_to',
      ],
      stateKey: 'paginated:punishments',
    },
  )

  async function fetchPunishments(options?: PunishmentFilters & { page?: number }) {
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
    error: paginated.error,
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
