import { refDebounced } from '@vueuse/core'
import type { Ref } from 'vue'

interface SearchListPageOptions<TFilters extends { search?: string }> {
  page: Readonly<Ref<number>>
  itemPerPage: Readonly<Ref<number>>
  totalCount: Readonly<Ref<number>>
  gotoPage: (page: number) => Promise<void>
  fetchPage: (options?: Partial<TFilters> & { page?: number }) => Promise<void>
  applyFilters: (filters: Partial<TFilters>) => Promise<void>
  buildFilters: (search: string) => Partial<TFilters>
  getAppliedSearch: () => string | undefined
  initialSearch?: string
  debounceMs?: number
}

export function useSearchListPage<TFilters extends { search?: string }>(
  options: SearchListPageOptions<TFilters>,
) {
  const searchQuery = ref(options.initialSearch || '')
  const searchDebounced = refDebounced(searchQuery, options.debounceMs || 300)
  const activeFilterCount = computed(() => (searchQuery.value ? 1 : 0))
  const { safeItemsPerPage, totalPages, showPagination } = usePaginationMetrics({
    itemPerPage: options.itemPerPage,
    totalCount: options.totalCount,
  })

  function buildSearchFilters(search = searchDebounced.value || '') {
    return options.buildFilters(search || '')
  }

  async function reload(pageToLoad = options.page.value || 1) {
    await options.fetchPage({
      page: pageToLoad,
      ...buildSearchFilters(),
    })
  }

  async function onPageChange(nextPage: number) {
    if (nextPage === options.page.value || nextPage < 1 || nextPage > totalPages.value) {
      return
    }

    await options.gotoPage(nextPage)
  }

  async function reloadCurrentPage() {
    await reload(options.page.value)
  }

  async function reloadFirstPage() {
    await reload(1)
  }

  function resetFilters() {
    searchQuery.value = ''
  }

  watch(searchDebounced, async (newSearch) => {
    const normalizedSearch = newSearch || ''
    if (normalizedSearch === (options.getAppliedSearch() || '')) return

    await options.applyFilters(buildSearchFilters(normalizedSearch))
  })

  return {
    searchQuery,
    searchDebounced,
    activeFilterCount,
    safeItemsPerPage,
    totalPages,
    showPagination,
    reload,
    reloadCurrentPage,
    reloadFirstPage,
    onPageChange,
    resetFilters,
  }
}
