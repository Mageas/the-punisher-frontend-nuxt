import { storeToRefs } from 'pinia'
import { markRaw, ref, reactive, computed, watch } from 'vue'
import { usePunishmentsStore } from '~/stores/punishments.store'
import { punishmentService } from '~/services/punishment.service'
import type { Punishment } from '~/types/api'

export function usePunishments() {
  const store = usePunishmentsStore()
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
    previousPage: storePrev
  } = storeToRefs(store)

  // -- Local Search --
  const search = ref('')
  const searchResults = ref<Punishment[]>([])
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
  async function fetchPunishments(options?: { page?: number; search?: string; state?: string; force?: boolean }) {
    const p = options?.page ?? (isSearchActive.value ? searchPagination.page : storePage.value)
    const s = options?.search !== undefined ? options.search : search.value
    const st = options?.state ?? (route.query.state as string | undefined)
    const force = options?.force ?? false

    if (s.trim().length > 0) {
      searchLoading.value = true
      const currentId = ++lastSearchId
      try {
        const res = await punishmentService.getPunishments({ page: p, search: s, state: st })
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
      await store.fetchPage({ page: p, filters: { state: st }, force })
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
      
      await fetchPunishments({ page: p, search: s, state: st || undefined })
    },
    { immediate: true, deep: true }
  )

  return {
    punishments: items,
    loading,
    page,
    filters: computed(() => ({ search: search.value, state: (route.query.state as string) || undefined })),
    itemPerPage,
    totalCount,
    nextPage,
    previousPage,
    fetchPunishments,
    gotoPage,
    applyFilters,
    
    // Mutations
    resolvePunishment: async (id: string) => {
      await punishmentService.resolvePunishment(id, {})
      store.invalidateAll()
      store.invalidateDependencies()
      await fetchPunishments({ force: true })
    },
    deletePunishment: async (id: string) => {
      await store.deleteOne(id)
      if (isSearchActive.value) await fetchPunishments()
    },
    createPunishment: async (payload: any) => {
      const res = await store.createOne(payload)
      if (isSearchActive.value) await fetchPunishments()
      return res
    },
    updatePunishment: async (id: string, payload: any) => {
      const res = await store.updateOne(id, payload)
      if (isSearchActive.value) await fetchPunishments()
      return res
    }
  }
}
