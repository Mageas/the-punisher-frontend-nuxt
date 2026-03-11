import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, type Ref } from 'vue'
import { usePaginatedCollection } from '../usePaginatedCollection'

// -- Mock Nuxt Composables --
const mockRoute = {
  query: {},
}
const mockRouter = {
  push: vi.fn(),
}
const mockState = new Map<string, Ref<unknown>>()

vi.mock('#app/composables/state', () => ({
  useState: (key: string, init: () => unknown) => {
    if (!mockState.has(key)) mockState.set(key, ref(init()))
    return mockState.get(key)
  },
}))

vi.mock('#app/composables/router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}))

describe('usePaginatedCollection', () => {
  beforeEach(() => {
    mockRoute.query = {}
    mockState.clear()
    vi.clearAllMocks()
  })

  it('initializes with default page 1', () => {
    const fetcher = vi.fn().mockResolvedValue({
      data: [],
      page: 1,
      item_per_page: 10,
      total_count: 0,
      next_page: null,
      previous_page: null,
    })

    const { page } = usePaginatedCollection(fetcher)
    expect(page.value).toBe(1)
  })

  it('initializes page from route query', () => {
    mockRoute.query = { page: '3' }
    const fetcher = vi.fn().mockResolvedValue({
      data: [],
      page: 3,
      item_per_page: 10,
      total_count: 0,
      next_page: null,
      previous_page: null,
    })

    const { page } = usePaginatedCollection(fetcher)
    expect(page.value).toBe(3)
  })

  it('fetches data on fetchPage call', async () => {
    const items = [{ id: '1', name: 'Test' }]
    const fetcher = vi.fn().mockResolvedValue({
      data: items,
      page: 1,
      item_per_page: 10,
      total_count: 1,
      next_page: null,
      previous_page: null,
    })

    const { fetchPage, items: collectionItems, loading } = usePaginatedCollection(fetcher)

    const fetchPromise = fetchPage()
    expect(loading.value).toBe(true)

    await fetchPromise

    expect(loading.value).toBe(false)
    expect(collectionItems.value).toEqual(items)
    expect(fetcher).toHaveBeenCalledWith({ page: 1 })
  })

  it('updates route on gotoPage', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      data: [],
      page: 2,
      item_per_page: 10,
      total_count: 20,
      next_page: null,
      previous_page: 1,
    })

    const { gotoPage } = usePaginatedCollection(fetcher)
    await gotoPage(2)

    expect(mockRouter.push).toHaveBeenCalledWith({
      query: { page: '2' },
    })
  })

  it('updates route on applyFilters', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      data: [],
      page: 1,
      item_per_page: 10,
      total_count: 0,
      next_page: null,
      previous_page: null,
    })

    const { applyFilters } = usePaginatedCollection(fetcher, {
      filterKeys: ['search'],
    })

    await applyFilters({ search: 'hello' })

    expect(mockRouter.push).toHaveBeenCalledWith({
      query: { search: 'hello' },
    })
  })

  it('ignores stale concurrent responses and keeps the latest page state', async () => {
    const resolvers = new Map<
      number,
      (value: {
        data: Array<{ id: string }>
        page: number
        item_per_page: number
        total_count: number
        next_page: number | null
        previous_page: number | null
      }) => void
    >()

    const fetcher = vi.fn().mockImplementation(
      ({ page }: { page?: number }) =>
        new Promise((resolve) => {
          resolvers.set(page ?? 1, resolve)
        }),
    )

    const { fetchPage, page, items, loading } = usePaginatedCollection(fetcher)

    const page2Request = fetchPage({ page: 2 })
    const page3Request = fetchPage({ page: 3 })

    expect(loading.value).toBe(true)

    resolvers.get(3)?.({
      data: [{ id: 'page-3' }],
      page: 3,
      item_per_page: 10,
      total_count: 30,
      next_page: 4,
      previous_page: 2,
    })
    await page3Request

    expect(page.value).toBe(3)
    expect(items.value).toEqual([{ id: 'page-3' }])
    expect(loading.value).toBe(false)

    resolvers.get(2)?.({
      data: [{ id: 'page-2' }],
      page: 2,
      item_per_page: 10,
      total_count: 30,
      next_page: 3,
      previous_page: 1,
    })
    await page2Request

    expect(page.value).toBe(3)
    expect(items.value).toEqual([{ id: 'page-3' }])
    expect(loading.value).toBe(false)
  })
})
