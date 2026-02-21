import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createStaticPaginatedStore } from '../_shared/createStaticPaginatedStore'

describe('createStaticPaginatedStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockService = {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }

  const createTestStore = (options = {}) => {
    return createStaticPaginatedStore<any, { search?: string, type?: string }>({
      id: 'test-store',
      resource: 'items',
      service: mockService,
      allowedStableFilterKeys: ['type'], // type is stable, search is volatile
      staleTimeMs: 1000,
      maxCachedPages: 3,
      ...options
    })
  }

  it('fetches page and caches it', async () => {
    const useStore = createTestStore()
    const store = useStore()

    const mockData = {
      data: [{ id: 1 }],
      page: 1,
      item_per_page: 10,
      total_count: 1,
      next_page: null,
      previous_page: null,
    }

    mockService.list.mockResolvedValue(mockData)

    // First fetch
    await store.fetchPage({ page: 1 })
    expect(mockService.list).toHaveBeenCalledTimes(1)
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe(1)

    // Second fetch (should be cached)
    await store.fetchPage({ page: 1 })
    expect(mockService.list).toHaveBeenCalledTimes(1) // Still 1
  })

  it('excludes volatile filters (search) from cache key', async () => {
    const useStore = createTestStore()
    const store = useStore()
    
    mockService.list.mockResolvedValue({
      data: [], page: 1, item_per_page: 10, total_count: 0, next_page: null, previous_page: null
    })

    // Fetch with stable filter 'type'
    await store.fetchPage({ page: 1, filters: { type: 'A' } })
    expect(mockService.list).toHaveBeenCalledWith({ type: 'A', page: 1 })
    
    // Fetch with volatile filter 'search' + stable 'type'
    // The factory filters out 'search' from stable keys!
    await store.fetchPage({ page: 1, filters: { type: 'A', search: 'hello' } })
    
    // Should hit cache for 'type=A' because search is ignored in key!
    // But wait, if I pass 'search', it is merged into stableFilters?
    // pickStableFilters only keeps allowed keys.
    // 'search' is NOT allowed. So stableFilters is JUST { type: 'A' }.
    // So key is same.
    // So it hits cache.
    // Service is NOT called again.
    expect(mockService.list).toHaveBeenCalledTimes(1)
  })

  it('invalidates cache on create', async () => {
    const useStore = createTestStore()
    const store = useStore()

    mockService.list.mockResolvedValue({
      data: [], page: 1, item_per_page: 10, total_count: 0, next_page: null, previous_page: null
    })
    mockService.create.mockResolvedValue({ id: 2 })

    // Populate cache
    await store.fetchPage({ page: 1 })
    expect(mockService.list).toHaveBeenCalledTimes(1)

    // Create item
    await store.createOne({ name: 'New' })
    expect(mockService.create).toHaveBeenCalled()
    
    // Should have invalidated and refetched page 1
    // So list should be called again (total 2 times)
    // createOne calls fetchPage({ page: 1, force: true })
    expect(mockService.list).toHaveBeenCalledTimes(2)
    expect(store.currentPage).toBe(1)
  })

  it('enforces LRU eviction', async () => {
    // maxCachedPages = 3
    const useStore = createTestStore({ maxCachedPages: 2 }) // Set to 2 for easier test
    const store = useStore()

    mockService.list.mockResolvedValue({
      data: [], page: 1, item_per_page: 10, total_count: 0, next_page: null, previous_page: null
    })

    // Fetch Page 1
    await store.fetchPage({ page: 1 }) // Cache: [1]
    // Fetch Page 2
    await store.fetchPage({ page: 2 }) // Cache: [1, 2]
    // Fetch Page 3
    await store.fetchPage({ page: 3 }) // Cache: [2, 3] (1 evicted?)
    // Wait, 1 was accessed first. 2 accessed second. 3 accessed third.
    // LRU eviction removes Least Recently Used.
    // When adding 3:
    // Sorted access times: 1 < 2.
    // Evict 1.
    // Cache has 2, 3.
    
    // Check internal state (pages)
    const keys = Object.keys(store.pages)
    expect(keys).toHaveLength(2)
    expect(keys).toContain('items:page=2')
    expect(keys).toContain('items:page=3')
    expect(keys).not.toContain('items:page=1')

    // Access Page 2 again (update lastAccessed)
    await store.fetchPage({ page: 2 }) 
    // Cache: [3, 2] (2 is most recent)

    // Fetch Page 4
    await store.fetchPage({ page: 4 })
    // Evict 3 (oldest accessed)
    
    const keys2 = Object.keys(store.pages)
    expect(keys2).toHaveLength(2)
    expect(keys2).toContain('items:page=2')
    expect(keys2).toContain('items:page=4')
    expect(keys2).not.toContain('items:page=3')
  })
})
