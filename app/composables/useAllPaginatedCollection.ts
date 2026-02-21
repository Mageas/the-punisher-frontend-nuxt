import type { PaginatedResponse, $Fetch } from '~/types/api'

type Fetcher<TItem, TArgs extends unknown[]> = ($api: $Fetch, options: { page: number }, ...args: TArgs) => Promise<PaginatedResponse<TItem>>

/**
 * Shared parent composable to fetch every page for a resource.
 */
export function useAllPaginatedCollection<TItem, TArgs extends unknown[] = []>(
  fetcher: Fetcher<TItem, TArgs>,
) {
  const { $api } = useNuxtApp()

  const items = ref<TItem[]>([])
  const loading = ref(false)

  async function fetchAll(...args: TArgs) {
    loading.value = true

    try {
      const all: TItem[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const res = await fetcher($api, { page }, ...args)

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
