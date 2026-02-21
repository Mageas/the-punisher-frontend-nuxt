import type { PaginatedResponse } from '~/types/api'

type QueryValue = string | number | boolean | null | undefined
type QueryOptions = Record<string, QueryValue>

/**
 * Defines a fetcher function that returns a response promise.
 */
type FetchSource<TItem, TOptions> = (
  options?: TOptions & { page?: number },
) => Promise<PaginatedResponse<TItem>>

export interface PaginatedCollectionOptions<TFilters> {
  /**
   * Optional key to sync the current page with the URL query parameters.
   * Defaults to 'page'. Set to null to disable URL sync for pagination.
   */
  pageKey?: string | null
  /**
   * List of keys from the filters object that should be synchronized with the URL.
   */
  filterKeys?: (keyof TFilters & string)[]
  /**
   * Default filter values.
   */
  defaultFilters?: Partial<TFilters>
}

/**
 * Shared parent composable for paginated resources with modular filter support.
 */
export function usePaginatedCollection<TItem, TFilters extends QueryOptions = QueryOptions>(
  source: FetchSource<TItem, TFilters>,
  options: PaginatedCollectionOptions<TFilters> = {},
) {
  const route = useRoute()
  const router = useRouter()

  const pageKey = options.pageKey === undefined ? 'page' : options.pageKey
  const filterKeys = options.filterKeys || []
  const defaultFilters = (options.defaultFilters || {}) as Partial<TFilters>

  // -- Reactive State --
  const items = ref<TItem[]>([]) as Ref<TItem[]>
  const loading = ref(false)
  const page = ref(1)
  const filters = reactive({ ...defaultFilters }) as TFilters
  const itemPerPage = ref(0)
  const totalCount = ref(0)
  const nextPage = ref<number | null>(null)
  const previousPage = ref<number | null>(null)

  function getQueryStringValue(value: unknown): string | undefined {
    if (typeof value === 'string') return value
    if (Array.isArray(value)) {
      const firstValue = value[0]
      return typeof firstValue === 'string' ? firstValue : undefined
    }
    return undefined
  }

  function applyFilterState(nextFilters: Partial<TFilters>) {
    for (const key of filterKeys) {
      // @ts-expect-error - dynamic key assignment
      filters[key] = nextFilters[key]
    }
  }

  /**
   * Extract state from current URL
   */
  function getStateFromRoute() {
    const query = route.query
    const routeFilters = {} as Partial<TFilters>

    for (const key of filterKeys) {
      // Ensure keys are always present so removed URL params are also removed from reactive filters.
      routeFilters[key] = defaultFilters[key]
    }

    const newState: { page: number; filters: Partial<TFilters> } = {
      page: 1,
      filters: routeFilters,
    }

    const routePage = pageKey ? getQueryStringValue(query[pageKey]) : undefined
    if (pageKey && routePage) {
      const p = parseInt(routePage)
      if (!isNaN(p) && p > 0) newState.page = p
    }

    for (const key of filterKeys) {
      const queryValue = getQueryStringValue(query[key])
      if (queryValue !== undefined) {
        // @ts-expect-error - dynamic key assignment
        newState.filters[key] = queryValue
      }
    }

    return newState
  }

  // Initialize state from route
  const initialState = getStateFromRoute()
  page.value = initialState.page
  applyFilterState(initialState.filters)

  /**
   * Main action to fetch data based on current state.
   */
  async function fetchPage(overrideOptions?: Partial<TFilters> & { page?: number }) {
    loading.value = true
    try {
      const fetchParams = {
        ...filters,
        page: page.value,
        ...overrideOptions,
      } as TFilters & { page?: number }

      const res = await source(fetchParams)

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
   * Updates the URL based on current state or provided overrides.
   * This will trigger the route watcher.
   */
  async function syncUrl(updates: { page?: number; filters?: Partial<TFilters> }) {
    const nextQuery = { ...route.query }

    // Handle Page
    if (pageKey) {
      const p = updates.page ?? page.value
      if (p > 1) {
        nextQuery[pageKey] = p.toString()
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete nextQuery[pageKey]
      }
    }

    // Handle Filters
    const newFilters = { ...filters, ...(updates.filters || {}) }
    for (const key of filterKeys) {
      const val = newFilters[key]
      if (val !== undefined && val !== null && val !== '' && val !== defaultFilters[key]) {
        nextQuery[key] = String(val)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete nextQuery[key]
      }
    }

    await router.push({ query: nextQuery })
  }

  /**
   * Changes page and syncs with URL.
   */
  async function gotoPage(newPage: number) {
    if (pageKey) {
      await syncUrl({ page: newPage })
    } else {
      page.value = newPage
      await fetchPage()
    }
  }

  /**
   * Applies new filters, resets to page 1, and syncs with URL.
   */
  async function applyFilters(newFilters: Partial<TFilters>) {
    if (filterKeys.length > 0 || pageKey) {
      await syncUrl({ page: 1, filters: newFilters })
    } else {
      Object.assign(filters, newFilters)
      page.value = 1
      await fetchPage()
    }
  }

  // Watch for route changes to keep state in sync and re-fetch
  watch(
    () => route.query,
    async () => {
      const newState = getStateFromRoute()

      // Check if anything actually changed to avoid redundant fetches
      const pageChanged = newState.page !== page.value
      const filtersChanged = filterKeys.some(
        (key) => String(newState.filters[key] ?? '') !== String(filters[key] ?? ''),
      )

      if (pageChanged || filtersChanged) {
        page.value = newState.page
        applyFilterState(newState.filters)
        await fetchPage()
      }
    },
    { deep: true },
  )

  return {
    items: items as Readonly<Ref<TItem[]>>,
    loading: readonly(loading),
    page: readonly(page),
    filters: readonly(filters),
    itemPerPage: readonly(itemPerPage),
    totalCount: readonly(totalCount),
    nextPage: readonly(nextPage),
    previousPage: readonly(previousPage),
    fetchPage,
    gotoPage,
    applyFilters,
  }
}
