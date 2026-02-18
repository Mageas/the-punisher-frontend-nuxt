import type { PaginatedResponse, PunishmentType } from '~/types/api'

/**
 * Composable to fetch ALL punishment types across all pages.
 */
export function useAllPunishmentTypes() {
  const { $api } = useNuxtApp()

  const punishmentTypes = ref<PunishmentType[]>([])
  const loading = ref(false)

  async function fetchPunishmentTypes() {
    loading.value = true
    const all: PunishmentType[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const res = await $api<PaginatedResponse<PunishmentType>>('/punishment-types/', {
        params: { page },
      })
      all.push(...res.data)
      hasMore = res.next_page !== null
      page++
    }

    punishmentTypes.value = all
    loading.value = false
  }

  return {
    punishmentTypes: punishmentTypes as Readonly<Ref<PunishmentType[]>>,
    loading: readonly(loading),
    fetchPunishmentTypes,
  }
}
