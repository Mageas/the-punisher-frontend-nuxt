import type { BonusType, PaginatedResponse } from '~/types/api'

/**
 * Composable to fetch ALL bonus types across all pages.
 */
export function useBonusTypes() {
  const { $api } = useNuxtApp()

  const bonusTypes = ref<BonusType[]>([])
  const loading = ref(false)

  async function fetchAllBonusTypes() {
    loading.value = true
    const all: BonusType[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const res = await $api<PaginatedResponse<BonusType>>('/bonus-types/', {
        params: { page },
      })
      all.push(...res.data)
      hasMore = res.next_page !== null
      page++
    }

    bonusTypes.value = all
    loading.value = false
  }

  return {
    bonusTypes: bonusTypes as Readonly<Ref<BonusType[]>>,
    loading: readonly(loading),
    fetchAllBonusTypes,
  }
}
