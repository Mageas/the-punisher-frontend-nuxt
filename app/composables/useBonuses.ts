import type { Bonus, PaginatedResponse } from '~/types/api'

/**
 * Composable to fetch and manage bonuses with pagination.
 */
export function useBonuses() {
  const { $api } = useNuxtApp()

  const bonuses = ref<Bonus[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemPerPage = ref(0)
  const totalCount = ref(0)
  const nextPage = ref<number | null>(null)
  const previousPage = ref<number | null>(null)

  async function fetchBonuses(options?: {
    page?: number
    state?: 'used' | 'unused'
    search?: string
  }) {
    loading.value = true
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.state) params.state = options.state
    if (options?.search) params.search = options.search

    const res = await $api<PaginatedResponse<Bonus>>('/bonuses/', {
      params,
    })

    bonuses.value = res.data
    page.value = res.page
    itemPerPage.value = res.item_per_page
    totalCount.value = res.total_count
    nextPage.value = res.next_page
    previousPage.value = res.previous_page
    loading.value = false
  }

  async function useBonus(id: string) {
    await $api<Bonus>(`/bonuses/${id}/use`, { method: 'POST' })
  }

  async function deleteBonus(id: string) {
    await $api(`/bonuses/${id}`, { method: 'DELETE' })
  }

  return {
    bonuses: bonuses as Readonly<Ref<Bonus[]>>,
    loading: readonly(loading),
    page: readonly(page),
    itemPerPage: readonly(itemPerPage),
    totalCount: readonly(totalCount),
    nextPage: readonly(nextPage),
    previousPage: readonly(previousPage),
    fetchBonuses,
    useBonus,
    deleteBonus,
  }
}
