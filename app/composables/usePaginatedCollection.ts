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
  /**
   * Optional key to sync the search query with the URL query parameters.
   * If provided, the composable will automatically read from and update this query parameter.
   */
  searchKey?: string
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
  const { queryKey, searchKey } = options

  // -- Reactive State --
  const items = ref<TItem[]>([]) as Ref<TItem[]>
  const loading = ref(false)
  const page = ref(1)
  const search = ref('')
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

  // Initialize search from route if searchKey is provided
  if (searchKey && route.query[searchKey]) {
    search.value = route.query[searchKey] as string
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
   * Updates the URL with the provided parameters.
   */
  async function syncUrl(newParams: { page?: number; search?: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nextQuery: Record<string, any> = { ...route.query }

    if (queryKey) {
      const p = newParams.page ?? page.value
      if (p > 1) {
        nextQuery[queryKey] = p.toString()
      } else {
        delete nextQuery[queryKey]
      }
    }

    if (searchKey) {
      const s = newParams.search !== undefined ? newParams.search : search.value
      if (s) {
        nextQuery[searchKey] = s
      } else {
        delete nextQuery[searchKey]
      }
    }

    await router.push({ query: nextQuery })
  }

  /**
   * Updates the page and optionally synchronizes with the URL.
   */
  async function gotoPage(newPage: number, fetchOptions?: TOptions) {
    if (queryKey || searchKey) {
      await syncUrl({ page: newPage })
    } else {
      await fetchPage({ ...fetchOptions, page: newPage } as TOptions & { page?: number })
    }
  }

  /**
   * Updates the search and optionally synchronizes with the URL.
   * Resetting to page 1 is the default behavior when search changes.
   */
  async function applySearch(newSearch: string, fetchOptions?: TOptions) {
    if (queryKey || searchKey) {
      await syncUrl({ search: newSearch, page: 1 })
    } else {
      await fetchPage({
        ...fetchOptions,
        search: newSearch,
        page: 1,
      } as unknown as TOptions & { page?: number })
    }
  }

  // Watch for route query changes if queryKey or searchKey is provided
  if (queryKey || searchKey) {
    watch(
      () => [queryKey ? route.query[queryKey] : null, searchKey ? route.query[searchKey] : null],
      async ([nextPageVal, nextSearchVal]) => {
        const p = nextPageVal ? parseInt(nextPageVal as string) || 1 : 1
        const s = (nextSearchVal as string) || ''

        if (p !== page.value || s !== search.value) {
          page.value = p
          search.value = s
          await fetchPage({
            page: p,
            search: s || undefined,
          } as unknown as TOptions & { page?: number })
        }
      },
    )
  }

  return {
    items: items as Readonly<Ref<TItem[]>>,
    loading: readonly(loading),
    page: readonly(page),
    search: readonly(search),
    itemPerPage: readonly(itemPerPage),
    totalCount: readonly(totalCount),
    nextPage: readonly(nextPage),
    previousPage: readonly(previousPage),
    fetchPage,
    gotoPage,
    applySearch,
  }
}
