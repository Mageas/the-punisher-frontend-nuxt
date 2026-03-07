import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { usePaginationMetrics } from '../usePaginationMetrics'

describe('usePaginationMetrics', () => {
  it('derives safe items per page, total pages and pagination visibility', () => {
    const metrics = usePaginationMetrics({
      itemPerPage: ref(0),
      totalCount: ref(21),
    })

    expect(metrics.safeItemsPerPage.value).toBe(10)
    expect(metrics.totalPages.value).toBe(3)
    expect(metrics.showPagination.value).toBe(true)
  })

  it('supports custom fallback items per page and hides pagination when empty', () => {
    const metrics = usePaginationMetrics({
      itemPerPage: ref(0),
      totalCount: ref(0),
      fallbackItemsPerPage: 25,
    })

    expect(metrics.safeItemsPerPage.value).toBe(25)
    expect(metrics.totalPages.value).toBe(1)
    expect(metrics.showPagination.value).toBe(false)
  })
})
