import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { PaginatedResponse } from '~/types/api'

type QueryValue = string | number | boolean | null | undefined
type QueryOptions = Record<string, QueryValue>

/**
 * Defines possible sources for the collection:
 * 1. A function returning a response promise (pure Fetcher)
 * 2. A function returning a URL string (URL Getter)
 * 3. A direct URL (string, ref, or getter)
 */
type FetchSource<TItem, TOptions> =
  | ((options?: TOptions & { page?: number }) => Promise<PaginatedResponse<TItem>> | string)
  | MaybeRefOrGetter<string>

/**
 * Shared parent composable for paginated resources.
 */
export function usePaginatedCollection<
  TItem,
  TOptions extends QueryOptions = QueryOptions,
>(source: FetchSource<TItem, TOptions>) {
  const { $api } = useNuxtApp()

  // -- Reactive State --
  const items = ref<TItem[]>([]) as Ref<TItem[]>
  const loading = ref(false)
  const page = ref(1)
  const itemPerPage = ref(0)
  const totalCount = ref(0)
  const nextPage = ref<number | null>(null)
  const previousPage = ref<number | null>(null)

  /**
   * Filters out empty, null, or undefined parameters from query object.
   */
  const filterParams = (options?: QueryOptions) => {
    if (!options) return {}
    return Object.fromEntries(
      Object.entries(options).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    )
  }

  /**
   * Resolves the data source and performs the API call if needed.
   */
  async function resolveData(options?: TOptions & { page?: number }): Promise<PaginatedResponse<TItem>> {
    if (typeof source === 'function') {
      const result = await source(options)

      // If function returns a string, treat it as a URL
      if (typeof result === 'string') {
        return $api<PaginatedResponse<TItem>>(result, {
          params: filterParams(options),
        })
      }
      // Otherwise, it was a fetcher that already returned the response
      return result
    }

    // Direct URL case (string, ref, or computed)
    const url = toValue(source)
    return $api<PaginatedResponse<TItem>>(url, {
      params: filterParams(options),
    })
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
