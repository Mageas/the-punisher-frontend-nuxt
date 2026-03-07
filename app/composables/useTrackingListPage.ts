import type { Ref } from 'vue'

interface TrackingListPageOptions<TFilters> {
  page: Readonly<Ref<number>>
  itemPerPage: Readonly<Ref<number>>
  totalCount: Readonly<Ref<number>>
  gotoPage: (page: number) => Promise<void>
  fetchPage: (options?: Partial<TFilters> & { page?: number }) => Promise<void>
  buildFilters: () => Partial<TFilters>
}

export function useTrackingListPage<TFilters>(options: TrackingListPageOptions<TFilters>) {
  const { safeItemsPerPage, totalPages } = usePaginationMetrics({
    itemPerPage: options.itemPerPage,
    totalCount: options.totalCount,
  })

  async function reload(pageToLoad = options.page.value || 1) {
    await options.fetchPage({
      page: pageToLoad,
      ...options.buildFilters(),
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

  return {
    safeItemsPerPage,
    totalPages,
    reload,
    reloadCurrentPage,
    reloadFirstPage,
    onPageChange,
  }
}
