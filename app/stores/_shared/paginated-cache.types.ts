export interface PageSlice<T> {
  data: T[]
  page: number
  itemPerPage: number
  totalCount: number
  nextPage: number | null
  previousPage: number | null
  fetchedAt: number
  lastAccessed: number // For LRU eviction
  stale: boolean
  loading: boolean
  error: string | null
  // Note: data is expected to be marked with markRaw() when inserted
}

export interface PaginatedStoreState<T, TFilters> {
  pages: Record<string, PageSlice<T>> // key: resource + page + stableFilters
  currentKey: string | null
  currentPage: number
  currentFilters: Partial<TFilters>
  pendingRequests: Record<string, Promise<void>> // For deduplication
}

export interface PaginatedStoreOptions<T, TFilters> {
  id: string
  resource: string
  staleTimeMs?: number
  maxCachedPages?: number
  allowedStableFilterKeys?: (keyof TFilters & string)[]
  fetcher: (
    params: TFilters & { page: number },
  ) => Promise<{
    data: T[]
    page: number
    item_per_page: number
    total_count: number
    next_page: number | null
    previous_page: number | null
  }>
}
