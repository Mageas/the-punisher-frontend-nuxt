import type { PaginatedResponse, PenaltyType } from '~/types/api'

/**
 * Composable to fetch ALL penalty types across all pages.
 */
export function usePenaltyTypes() {
  const { $api } = useNuxtApp()

  const penaltyTypes = ref<PenaltyType[]>([])
  const loading = ref(false)

  async function fetchAllPenaltyTypes() {
    loading.value = true
    const all: PenaltyType[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const res = await $api<PaginatedResponse<PenaltyType>>('/penalty-types/', {
        params: { page },
      })
      all.push(...res.data)
      hasMore = res.next_page !== null
      page++
    }

    penaltyTypes.value = all
    loading.value = false
  }

  return {
    penaltyTypes: penaltyTypes as Readonly<Ref<PenaltyType[]>>,
    loading: readonly(loading),
    fetchAllPenaltyTypes,
  }
}
