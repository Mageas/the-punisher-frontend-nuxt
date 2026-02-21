import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePaginatedCollection } from '../usePaginatedCollection'

// -- Mock Nuxt Composables --
const mockRoute = {
  query: {},
}
const mockRouter = {
  push: vi.fn(),
}

vi.mock('#app/composables/router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter,
}))

describe('usePaginatedCollection', () => {
  beforeEach(() => {
    mockRoute.query = {}
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
})
