import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useSearchListPage } from '../useSearchListPage'

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core')
  return {
    ...actual,
    refDebounced: <T>(value: T) => value,
  }
})

describe('useSearchListPage', () => {
  it('syncs the search filter and reuses it for reload helpers', async () => {
    const page = ref(2)
    const appliedSearch = ref('')
    const gotoPage = vi.fn().mockResolvedValue(undefined)
    const fetchPage = vi.fn().mockResolvedValue(undefined)
    const applyFilters = vi.fn().mockResolvedValue(undefined)

    const searchPage = useSearchListPage({
      page,
      itemPerPage: ref(0),
      totalCount: ref(21),
      gotoPage,
      fetchPage,
      applyFilters,
      buildFilters: (search) => ({
        search: search || undefined,
      }),
      getAppliedSearch: () => appliedSearch.value,
      initialSearch: '',
    })

    expect(searchPage.safeItemsPerPage.value).toBe(10)
    expect(searchPage.totalPages.value).toBe(3)
    expect(searchPage.showPagination.value).toBe(true)
    expect(searchPage.activeFilterCount.value).toBe(0)

    searchPage.searchQuery.value = 'math'
    await nextTick()

    expect(applyFilters).toHaveBeenLastCalledWith({
      search: 'math',
    })
    expect(searchPage.activeFilterCount.value).toBe(1)

    appliedSearch.value = 'math'

    await searchPage.reloadCurrentPage()
    expect(fetchPage).toHaveBeenLastCalledWith({
      page: 2,
      search: 'math',
    })

    await searchPage.reloadFirstPage()
    expect(fetchPage).toHaveBeenLastCalledWith({
      page: 1,
      search: 'math',
    })

    await searchPage.onPageChange(3)
    expect(gotoPage).toHaveBeenCalledWith(3)

    gotoPage.mockClear()
    await searchPage.onPageChange(2)
    await searchPage.onPageChange(0)
    await searchPage.onPageChange(4)
    expect(gotoPage).not.toHaveBeenCalled()

    searchPage.resetFilters()
    await nextTick()

    expect(applyFilters).toHaveBeenLastCalledWith({
      search: undefined,
    })
    expect(searchPage.activeFilterCount.value).toBe(0)
  })
})
