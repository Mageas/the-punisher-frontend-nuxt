import type { PaginatedResponse } from '~/types/api'

type QueryValue = string | number | boolean | null | undefined
type QueryOptions = Record<string, QueryValue>

function shouldKeepParam(value: QueryValue): boolean {
  return value !== undefined && value !== null && value !== ''
}

/**
 * Shared parent composable for paginated resources.
 */
export function usePaginatedCollection<
  TItem,
  TOptions extends QueryOptions = QueryOptions,
>(endpoint: string) {
  const { $api } = useNuxtApp()

  const items = ref<TItem[]>([])
  const loading = ref(false)
  const page = ref(1)
  const itemPerPage = ref(0)
  const totalCount = ref(0)
  const nextPage = ref<number | null>(null)
  const previousPage = ref<number | null>(null)

  async function fetchPage(options?: TOptions & { page?: number }) {
    loading.value = true

    try {
      const params: Record<string, unknown> = {}

      if (options) {
        for (const [key, value] of Object.entries(options)) {
          if (shouldKeepParam(value)) {
            params[key] = value
          }
        }
      }

      const res = await $api<PaginatedResponse<TItem>>(endpoint, { params })

      items.value = res.data
      page.value = res.page
      itemPerPage.value = res.item_per_page
      totalCount.value = res.total_count
      nextPage.value = res.next_page
      previousPage.value = res.previous_page
    }
    finally {
      loading.value = false
    }
  }

  return {
    items: items as Readonly<Ref<TItem[]>>,
    loading: readonly(loading),
    page: readonly(page),
    itemPerPage: readonly(itemPerPage),
    totalCount: readonly(totalCount),
    nextPage: readonly(nextPage),
    previousPage: readonly(previousPage),
    fetchPage,
  }
}
