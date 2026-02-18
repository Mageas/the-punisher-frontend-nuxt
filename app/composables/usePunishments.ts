import type { PaginatedResponse, Punishment } from '~/types/api'

/**
 * Composable to fetch and manage punishments with pagination.
 */
export function usePunishments() {
  const { $api } = useNuxtApp()

  const punishments = ref<Punishment[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemPerPage = ref(0)
  const totalCount = ref(0)
  const nextPage = ref<number | null>(null)
  const previousPage = ref<number | null>(null)

  async function fetchPunishments(options?: {
    page?: number
    state?: 'pending' | 'resolved'
    search?: string
  }) {
    loading.value = true
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.state) params.state = options.state
    if (options?.search) params.search = options.search

    const res = await $api<PaginatedResponse<Punishment>>('/punishments/', {
      params,
    })

    punishments.value = res.data
    page.value = res.page
    itemPerPage.value = res.item_per_page
    totalCount.value = res.total_count
    nextPage.value = res.next_page
    previousPage.value = res.previous_page
    loading.value = false
  }

  async function resolvePunishment(id: string) {
    await $api<Punishment>(`/punishments/${id}/resolve`, { method: 'POST' })
  }

  async function deletePunishment(id: string) {
    await $api(`/punishments/${id}`, { method: 'DELETE' })
  }

  return {
    punishments: punishments as Readonly<Ref<Punishment[]>>,
    loading: readonly(loading),
    page: readonly(page),
    itemPerPage: readonly(itemPerPage),
    totalCount: readonly(totalCount),
    nextPage: readonly(nextPage),
    previousPage: readonly(previousPage),
    fetchPunishments,
    resolvePunishment,
    deletePunishment,
  }
}
