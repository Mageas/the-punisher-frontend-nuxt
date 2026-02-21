import type { PaginatedResponse } from '~/types/api'

type QueryValue = string | number | boolean | null | undefined
type QueryOptions = Record<string, QueryValue>

/**
 * Defines a fetcher function that returns a response promise.
 */
type FetchSource<TItem, TOptions> = (
  options?: TOptions & { page?: number },
) => Promise<PaginatedResponse<TItem>>

export interface PaginatedCollectionOptions {
  /**
   * Optional key to sync the current page with the URL query parameters.
   * If provided, the composable will automatically read from and update this query parameter.
   */
  queryKey?: string
}

/**
 * Shared parent composable for paginated resources.
 */
export function usePaginatedCollection<TItem, TOptions extends QueryOptions = QueryOptions>(
  source: FetchSource<TItem, TOptions>,
  options: PaginatedCollectionOptions = {},
) {
  const route = useRoute()
  const router = useRouter()
  const { queryKey } = options

  // -- Reactive State --
  const items = ref<TItem[]>([]) as Ref<TItem[]>
  const loading = ref(false)
  const page = ref(1)
  const itemPerPage = ref(0)
  const totalCount = ref(0)
  const nextPage = ref<number | null>(null)
  const previousPage = ref<number | null>(null)

  // Initialize page from route if queryKey is provided
  if (queryKey && route.query[queryKey]) {
    const p = parseInt(route.query[queryKey] as string)
    if (!isNaN(p) && p > 0) {
      page.value = p
    }
  }

  /**
   * Resolves the data source and performs the API call.
   */
  async function resolveData(
    fetchOptions?: TOptions & { page?: number },
  ): Promise<PaginatedResponse<TItem>> {
    return await source(fetchOptions)
  }

  /**
   * Main action to fetch a specific page with options.
   */
  async function fetchPage(fetchOptions?: TOptions & { page?: number }) {
    loading.value = true
    try {
      const res = await resolveData(fetchOptions)

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

  /**
   * Updates the page and optionally synchronizes with the URL.
   */
  async function gotoPage(newPage: number, fetchOptions?: TOptions) {
    if (queryKey) {
      await router.push({
        query: {
          ...route.query,
          [queryKey]: newPage.toString(),
        },
      })
      // The watcher below will trigger fetchPage
    } else {
      await fetchPage({ ...fetchOptions, page: newPage } as TOptions & { page?: number })
    }
  }

  // Watch for route query changes if queryKey is provided
  if (queryKey) {
    watch(
      () => route.query[queryKey],
      async (newVal) => {
        const p = parseInt(newVal as string) || 1
        if (p !== page.value) {
          await fetchPage({ page: p } as TOptions & { page?: number })
        }
      },
    )
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
    gotoPage,
  }
}
