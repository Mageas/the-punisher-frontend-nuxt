import type { PaginatedResponse } from '~/types/api'

/**
 * Shared parent composable to fetch every page for a resource.
 */
export function useAllPaginatedCollection<TItem, TArgs extends unknown[] = []>(
  resolveEndpoint: (...args: TArgs) => string,
) {
  const { $api } = useNuxtApp()

  const items = ref<TItem[]>([])
  const loading = ref(false)

  async function fetchAll(...args: TArgs) {
    loading.value = true

    try {
      const all: TItem[] = []
      const endpoint = resolveEndpoint(...args)
      let page = 1
      let hasMore = true

      while (hasMore) {
        const res = await $api<PaginatedResponse<TItem>>(endpoint, {
          params: { page },
        })

        all.push(...res.data)
        hasMore = res.next_page !== null
        page++
      }

      items.value = all
    }
    finally {
      loading.value = false
    }
  }

  return {
    items: items as Readonly<Ref<TItem[]>>,
    loading: readonly(loading),
    fetchAll,
  }
}
