import type { PaginatedResponse, ApiError } from '~/types/api'

type Fetcher<TItem, TArgs extends unknown[]> = (
  options: { page: number },
  ...args: TArgs
) => Promise<PaginatedResponse<TItem>>

export interface AllPaginatedCollectionOptions {
  /**
   * Maximum number of pages to fetch to avoid memory issues.
   * Defaults to 10.
   */
  maxPages?: number
  /**
   * When enabled, re-throw fetch errors after updating local error state.
   * Useful for pages where partial SSR data is not acceptable.
   */
  throwOnError?: boolean
  /**
   * Base key used to persist and hydrate collection state via Nuxt payload.
   */
  stateKey?: string
}

let fallbackStateScopeId = 0

function createScopedStateKey(baseStateKey: string): string {
  if (getCurrentInstance()) {
    return `${baseStateKey}:${useId()}`
  }

  fallbackStateScopeId += 1
  return `${baseStateKey}:fallback:${fallbackStateScopeId}`
}

/**
 * Shared parent composable to fetch every page for a resource.
 */
export function useAllPaginatedCollection<TItem, TArgs extends unknown[] = []>(
  fetcher: Fetcher<TItem, TArgs>,
  options: AllPaginatedCollectionOptions = {},
) {
  const nuxtApp = useNuxtApp()
  const stateKey = createScopedStateKey(options.stateKey || 'all-paginated-collection')
  const items = useState<TItem[]>(`${stateKey}:items`, () => [])
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  const maxPages = options.maxPages ?? 10
  const throwOnError = options.throwOnError ?? false
  let lastCallId = 0

  async function fetchAll(...args: TArgs) {
    const callId = ++lastCallId
    loading.value = true
    error.value = null

    try {
      const all: TItem[] = []

      // 1. Fetch first page to know total count and items per page
      const firstRes = await nuxtApp.runWithContext(() => fetcher({ page: 1 }, ...args))

      if (callId !== lastCallId) return
      all.push(...firstRes.data)

      // 2. If there are more pages, fetch them (parallelized for performance)
      if (firstRes.next_page !== null && maxPages > 1) {
        const perPage = firstRes.item_per_page
        const totalCount = firstRes.total_count

        if (perPage > 0) {
          const totalPages = Math.min(maxPages, Math.ceil(totalCount / perPage))
          const pagePromises = []

          for (let p = 2; p <= totalPages; p++) {
            pagePromises.push(nuxtApp.runWithContext(() => fetcher({ page: p }, ...args)))
          }

          const otherPages = await Promise.all(pagePromises)
          if (callId !== lastCallId) return

          for (const res of otherPages) {
            all.push(...res.data)
          }
        } else {
          // Fallback to sequential if perPage is missing or 0
          let page = 2
          let hasMore = true
          while (hasMore && page <= maxPages) {
            const res = await nuxtApp.runWithContext(() => fetcher({ page }, ...args))
            if (callId !== lastCallId) return
            all.push(...res.data)
            hasMore = res.next_page !== null
            page++
          }
        }
      }

      items.value = all
    } catch (err: unknown) {
      if (callId !== lastCallId) return

      let errorData: ApiError = { error: 'internal_error', error_code: 500 }

      if (err && typeof err === 'object' && 'data' in err) {
        errorData = (err as { data: ApiError }).data
      }

      error.value = errorData

      if (throwOnError) {
        throw err
      }
    } finally {
      if (callId === lastCallId) {
        loading.value = false
      }
    }
  }

  return {
    items: items as Readonly<Ref<TItem[]>>,
    loading: readonly(loading),
    error: readonly(error),
    fetchAll,
  }
}
