import type { PaginatedResponse } from '~/types/api'

type QueryValue = string | number | boolean | null | undefined
type QueryOptions = Record<string, QueryValue>

/**
 * Defines a fetcher function that returns a response promise.
 */
type FetchSource<TItem, TOptions> = (
  options?: TOptions & { page?: number },
) => Promise<PaginatedResponse<TItem>>

/**
 * Shared parent composable for paginated resources.
 */
export function usePaginatedCollection<TItem, TOptions extends QueryOptions = QueryOptions>(
  source: FetchSource<TItem, TOptions>,
) {
  // -- Reactive State --
  const items = ref<TItem[]>([]) as Ref<TItem[]>
  const loading = ref(false)
  const page = ref(1)
  const itemPerPage = ref(0)
  const totalCount = ref(0)
  const nextPage = ref<number | null>(null)
  const previousPage = ref<number | null>(null)

  /**
   * Resolves the data source and performs the API call.
   */
  async function resolveData(
    options?: TOptions & { page?: number },
  ): Promise<PaginatedResponse<TItem>> {
    return await source(options)
  }

  /**
   * Main action to fetch a specific page with options.
   */
  async function fetchPage(options?: TOptions & { page?: number }) {
    loading.value = true
    try {
      const res = await resolveData(options)

      items.value = res.data
      page.value = res.page
      itemPerPage.value = res.item_per_page
      totalCount.value = res.total_count
      nextPage.value = res.next_page
      previousPage.value = res.previous_page
    } finally {
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
