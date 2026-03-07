import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { useTrackingListPage } from '../useTrackingListPage'

describe('useTrackingListPage', () => {
  it('reuses the current filters for reload helpers and guards invalid page changes', async () => {
    const gotoPage = vi.fn().mockResolvedValue(undefined)
    const fetchPage = vi.fn().mockResolvedValue(undefined)

    const trackingPage = useTrackingListPage({
      page: ref(2),
      itemPerPage: ref(0),
      totalCount: ref(21),
      gotoPage,
      fetchPage,
      buildFilters: () => ({
        classroom_id: 'class-1',
        state: 'pending',
      }),
    })

    expect(trackingPage.safeItemsPerPage.value).toBe(10)
    expect(trackingPage.totalPages.value).toBe(3)

    await trackingPage.reloadCurrentPage()
    expect(fetchPage).toHaveBeenCalledWith({
      page: 2,
      classroom_id: 'class-1',
      state: 'pending',
    })

    await trackingPage.reloadFirstPage()
    expect(fetchPage).toHaveBeenLastCalledWith({
      page: 1,
      classroom_id: 'class-1',
      state: 'pending',
    })

    await trackingPage.onPageChange(3)
    expect(gotoPage).toHaveBeenCalledWith(3)

    gotoPage.mockClear()
    await trackingPage.onPageChange(2)
    await trackingPage.onPageChange(0)
    await trackingPage.onPageChange(4)
    expect(gotoPage).not.toHaveBeenCalled()
  })
})
