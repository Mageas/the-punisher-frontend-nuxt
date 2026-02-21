import { defineStore, getActivePinia } from 'pinia'
import { ref, reactive, computed, markRaw } from 'vue'
import type { PageSlice } from './paginated-cache.types'
import { buildPageKey, isFresh, pickStableFilters } from './paginated-cache.utils'
import { getDependentStores } from './invalidation-map'

// Define a flexible service interface
/* eslint-disable @typescript-eslint/no-explicit-any */
interface PaginatedService<T, TFilters> {
  list(params: TFilters & { page?: number }): Promise<{
    data: T[]
    page: number
    item_per_page: number
    total_count: number
    next_page: number | null
    previous_page: number | null
  }>
  create?(payload: any): Promise<any>
  update?(id: string, payload: any): Promise<any>
  delete?(id: string): Promise<any>
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface CreateStoreOptions<T, TFilters> {
  id: string
  resource: string
  service: PaginatedService<T, TFilters>
  allowedStableFilterKeys?: (keyof TFilters & string)[]
  staleTimeMs?: number
  maxCachedPages?: number
}

export function createStaticPaginatedStore<T, TFilters extends Record<string, unknown>>(
  options: CreateStoreOptions<T, TFilters>,
) {
  return defineStore(options.id, () => {
    // -- State --
    const pages = reactive<Record<string, PageSlice<T>>>({})
    const currentKey = ref<string | null>(null)
    const currentPage = ref(1)
    const currentFilters = ref<Partial<TFilters>>({})
    
    // Deduplication
    const pendingRequests = new Map<string, Promise<void>>()

    // -- Config --
    const staleTime = options.staleTimeMs ?? 30_000
    const maxPages = options.maxCachedPages ?? 20
    const allowedKeys = options.allowedStableFilterKeys ?? []

    // -- Helpers --

    function getStableFilters(filters: Partial<TFilters>) {
      return pickStableFilters(filters, allowedKeys)
    }

    function enforceLruLimit() {
      const keys = Object.keys(pages)
      if (keys.length <= maxPages) return

      // Sort by lastAccessed (ascending = least recently used first)
      const sorted = keys
        .map(k => ({ key: k, ts: pages[k].lastAccessed }))
        .sort((a, b) => a.ts - b.ts)

      // Remove oldest accessed pages until limit is met
      // Protect the current page being viewed (currentKey) if possible
      for (const item of sorted) {
        if (item.key !== currentKey.value) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete pages[item.key]
          if (Object.keys(pages).length <= maxPages) break
        }
      }
    }

    function invalidateAll() {
      // Clear cache completely to force fresh fetches
      for (const key in pages) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete pages[key]
      }
      currentKey.value = null
    }

    function invalidateDependencies() {
      const pinia = getActivePinia()
      if (!pinia) return

      const dependentIds = getDependentStores(options.resource)
      for (const depId of dependentIds) {
        // Access dependent store dynamically via Pinia's internal map
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const store = (pinia as any)._s.get(depId)
        if (store && typeof store.invalidateAll === 'function') {
          store.invalidateAll()
        }
      }
    }

    // -- Actions --

    async function fetchPage(params: { page?: number; filters?: Partial<TFilters>; force?: boolean } = {}) {
      const page = Math.max(1, params.page ?? currentPage.value)
      const mergedFilters = { ...currentFilters.value, ...(params.filters || {}) }
      const stableFilters = getStableFilters(mergedFilters)
      const key = buildPageKey(options.resource, page, stableFilters)

      // Update pointers immediately so UI knows what we are trying to load
      currentPage.value = page
      currentFilters.value = stableFilters

      // 1. Check Cache
      const cached = pages[key]
      const isCacheFresh = cached && isFresh(cached.fetchedAt, staleTime) && !cached.stale

      if (!params.force && isCacheFresh) {
        currentKey.value = key
        // Update LRU timestamp
        cached.lastAccessed = Date.now()
        return
      }

      // 2. Deduplication
      if (pendingRequests.has(key)) {
        await pendingRequests.get(key)
        // Re-check cache after wait
        if (pages[key]) {
          currentKey.value = key
          pages[key].lastAccessed = Date.now()
          return
        }
      }

      // 3. Fetch API
      const requestPromise = (async () => {
        try {
          // Initialize/Reset state for this key
          if (!pages[key]) {
             pages[key] = {
              data: [],
              page,
              itemPerPage: 0,
              totalCount: 0,
              nextPage: null,
              previousPage: null,
              fetchedAt: 0,
              lastAccessed: Date.now(),
              stale: false,
              loading: true, // Start loading
              error: null,
            }
          } else {
            pages[key].loading = true
            pages[key].error = null
          }
          
          // Notify UI that we are loading this key
          currentKey.value = key

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const res = await options.service.list({ ...stableFilters, page } as any)

          // 4. Update State
          // Check if key still exists (might be cleared by invalidation during fetch)
          if (pages[key]) {
            pages[key] = {
              data: markRaw(res.data), // Optimization: shallow reactivity
              page: res.page,
              itemPerPage: res.item_per_page,
              totalCount: res.total_count,
              nextPage: res.next_page,
              previousPage: res.previous_page,
              fetchedAt: Date.now(),
              lastAccessed: Date.now(),
              stale: false,
              loading: false,
              error: null,
            }
          }

          // 5. LRU Eviction
          enforceLruLimit()

        } catch (err: any) {
          if (pages[key]) {
            pages[key].loading = false
            pages[key].error = err.message || 'Error fetching data'
          }
          // Security: Rethrow 401/403
          if (err.statusCode === 401 || err.statusCode === 403 || err.response?.status === 401 || err.response?.status === 403) {
            throw err
          }
          // Optional: rethrow other errors or handle them gracefully in UI via error state
          console.error(`Error fetching page ${key}:`, err)
        } finally {
          pendingRequests.delete(key)
        }
      })()

      pendingRequests.set(key, requestPromise)
      await requestPromise
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function createOne(payload: any) {
      if (!options.service.create) throw new Error('Create service not defined')
      const res = await options.service.create(payload)
      invalidateAll()
      invalidateDependencies()
      // Refetch page 1 to see new item
      await fetchPage({ page: 1, force: true })
      return res
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function updateOne(id: string, payload: any) {
      if (!options.service.update) throw new Error('Update service not defined')
      const res = await options.service.update(id, payload)
      invalidateAll()
      invalidateDependencies()
      // Refetch current page to see update
      await fetchPage({ page: currentPage.value, force: true })
      return res
    }

    async function deleteOne(id: string) {
      if (!options.service.delete) throw new Error('Delete service not defined')
      const res = await options.service.delete(id)
      invalidateAll()
      invalidateDependencies()
      // Refetch current page to remove item
      await fetchPage({ page: currentPage.value, force: true })
      return res
    }

    return {
      // State
      pages,
      currentKey,
      currentPage,
      currentFilters,
      
      // Getters
      currentPageSlice: computed(() => currentKey.value ? pages[currentKey.value] : null),
      items: computed(() => (currentKey.value && pages[currentKey.value]) ? pages[currentKey.value].data : []),
      loading: computed(() => (currentKey.value && pages[currentKey.value]) ? pages[currentKey.value].loading : false),
      error: computed(() => (currentKey.value && pages[currentKey.value]) ? pages[currentKey.value].error : null),
      totalCount: computed(() => (currentKey.value && pages[currentKey.value]) ? pages[currentKey.value].totalCount : 0),
      nextPage: computed(() => (currentKey.value && pages[currentKey.value]) ? pages[currentKey.value].nextPage : null),
      previousPage: computed(() => (currentKey.value && pages[currentKey.value]) ? pages[currentKey.value].previousPage : null),
      itemPerPage: computed(() => (currentKey.value && pages[currentKey.value]) ? pages[currentKey.value].itemPerPage : 0),

      // Actions
      fetchPage,
      createOne,
      updateOne,
      deleteOne,
      invalidateAll,
      invalidateDependencies
    }
  })
}
