import { storeToRefs } from 'pinia'
import { markRaw, ref, reactive, computed, watch } from 'vue'
import { useBonusesStore } from '~/stores/bonuses.store'
import { bonusService } from '~/services/bonus.service'
import type { Bonus } from '~/types/api'

export function useBonuses() {
  const store = useBonusesStore()
  const route = useRoute()
  const router = useRouter()

  // -- Store --
  const { 
    items: storeItems, 
    loading: storeLoading, 
    currentPage: storePage, 
    totalCount: storeTotal, 
    itemPerPage: storeLimit,
    nextPage: storeNext,
    previousPage: storePrev,
    currentFilters: storeFilters
  } = storeToRefs(store)

  // -- Local Search --
  const search = ref('')
  const searchResults = ref<Bonus[]>([])
  const searchLoading = ref(false)
  const searchPagination = reactive({
    page: 1,
    totalCount: 0,
    itemPerPage: 0,
    nextPage: null as number | null,
    previousPage: null as number | null,
  })
  
  let lastSearchId = 0
  const isSearchActive = computed(() => search.value.trim().length > 0)

  // -- Unified --
  const items = computed(() => isSearchActive.value ? searchResults.value : storeItems.value)
  const loading = computed(() => isSearchActive.value ? searchLoading.value : storeLoading.value)
  const page = computed(() => isSearchActive.value ? searchPagination.page : storePage.value)
  const totalCount = computed(() => isSearchActive.value ? searchPagination.totalCount : storeTotal.value)
  const itemPerPage = computed(() => isSearchActive.value ? searchPagination.itemPerPage : storeLimit.value)
  const nextPage = computed(() => isSearchActive.value ? searchPagination.nextPage : storeNext.value)
  const previousPage = computed(() => isSearchActive.value ? searchPagination.previousPage : storePrev.value)

  // -- Fetch --
  async function fetchBonuses(options?: { page?: number; search?: string; state?: string; force?: boolean }) {
    const p = options?.page ?? (isSearchActive.value ? searchPagination.page : storePage.value)
    const s = options?.search !== undefined ? options.search : search.value
    // If state is not provided in options, use current store filter (for non-search) or fallback
    // Actually store.currentFilters has partial TFilters.
    // Let's rely on route or passed options.
    const stateFilter = options?.state ?? (route.query.state as string | undefined)
    
    const force = options?.force ?? false

    if (s.trim().length > 0) {
      searchLoading.value = true
      const currentId = ++lastSearchId
      try {
        const res = await bonusService.getBonuses({ page: p, search: s, state: stateFilter })
        if (currentId === lastSearchId) {
          searchResults.value = markRaw(res.data)
          searchPagination.page = res.page
          searchPagination.totalCount = res.total_count
          searchPagination.itemPerPage = res.item_per_page
          searchPagination.nextPage = res.next_page
          searchPagination.previousPage = res.previous_page
        }
      } catch (err) {
        if (currentId === lastSearchId) {
          console.error('Search failed', err)
          searchResults.value = []
        }
      } finally {
        if (currentId === lastSearchId) searchLoading.value = false
      }
    } else {
      await store.fetchPage({ page: p, filters: { state: stateFilter }, force })
    }
  }

  // -- Navigation --
  async function gotoPage(newPage: number) {
    const query = { ...route.query, page: String(newPage) }
    await router.push({ query })
  }

  async function applyFilters(newFilters: { search?: string; state?: string }) {
    const query = { ...route.query }
    
    if (newFilters.search !== undefined) {
      if (newFilters.search) query.search = newFilters.search
      else delete query.search
    }

    if (newFilters.state !== undefined) {
      if (newFilters.state) query.state = newFilters.state
      else delete query.state
    }
    
    query.page = '1'
    await router.push({ query })
  }

  // -- URL Sync --
  watch(
    () => route.query,
    async (newQuery) => {
      const p = Number(newQuery.page) || 1
      const s = String(newQuery.search || '')
      const st = String(newQuery.state || '')
      
      search.value = s
      
      // We pass state explicitly to fetchBonuses
      await fetchBonuses({ page: p, search: s, state: st || undefined })
    },
    { immediate: true, deep: true }
  )

  return {
    bonuses: items,
    loading,
    page,
    filters: computed(() => ({ search: search.value, state: (route.query.state as string) || undefined })),
    itemPerPage,
    totalCount,
    nextPage,
    previousPage,
    fetchBonuses,
    gotoPage,
    applyFilters,
    
    // Custom Actions
    useBonus: async (id: string) => {
      // Manual service call + invalidation
      await bonusService.useBonus(id, {})
      store.invalidateAll()
      store.invalidateDependencies()
      // Refetch
      await fetchBonuses({ force: true }) 
    },
    
    deleteBonus: async (id: string) => {
      await store.deleteOne(id)
      if (isSearchActive.value) await fetchBonuses()
    },
    
    createBonus: async (payload: any) => {
      const res = await store.createOne(payload)
      if (isSearchActive.value) await fetchBonuses()
      return res
    },
    
    updateBonus: async (id: string, payload: any) => {
      const res = await store.updateOne(id, payload)
      if (isSearchActive.value) await fetchBonuses()
      return res
    }
  }
}
