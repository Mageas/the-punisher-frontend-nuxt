import { storeToRefs } from 'pinia'
import { markRaw, ref, reactive, computed, watch } from 'vue'
import { useClassroomsStore } from '~/stores/classrooms.store'
import { classroomService } from '~/services/classroom.service'
import type { Classroom } from '~/types/api'

/**
 * Composable to fetch and manage classrooms with pagination.
 */
export function useClassrooms() {
  const store = useClassroomsStore()
  const route = useRoute()
  const router = useRouter()

  // -- Store State --
  const { 
    items: storeItems, 
    loading: storeLoading, 
    currentPage: storePage, 
    totalCount: storeTotal, 
    itemPerPage: storeLimit,
    nextPage: storeNext,
    previousPage: storePrev
  } = storeToRefs(store)

  // -- Local Search State --
  const search = ref('')
  const searchResults = ref<Classroom[]>([])
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

  // -- Unified State --
  const items = computed(() => isSearchActive.value ? searchResults.value : storeItems.value)
  const loading = computed(() => isSearchActive.value ? searchLoading.value : storeLoading.value)
  const page = computed(() => isSearchActive.value ? searchPagination.page : storePage.value)
  const totalCount = computed(() => isSearchActive.value ? searchPagination.totalCount : storeTotal.value)
  const itemPerPage = computed(() => isSearchActive.value ? searchPagination.itemPerPage : storeLimit.value)
  const nextPage = computed(() => isSearchActive.value ? searchPagination.nextPage : storeNext.value)
  const previousPage = computed(() => isSearchActive.value ? searchPagination.previousPage : storePrev.value)

  // -- Fetch Logic --
  async function fetchClassrooms(options?: { page?: number; search?: string; force?: boolean }) {
    const p = options?.page ?? (isSearchActive.value ? searchPagination.page : storePage.value)
    // If options.search is provided, use it. Otherwise use current search state.
    const s = options?.search !== undefined ? options.search : search.value
    const force = options?.force ?? false

    if (s.trim().length > 0) {
      searchLoading.value = true
      const currentId = ++lastSearchId
      
      try {
        const res = await classroomService.getClassrooms({ page: p, search: s })
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
      await store.fetchPage({ page: p, force })
    }
  }

  // -- Navigation Actions --
  async function gotoPage(newPage: number) {
    const query = { ...route.query, page: String(newPage) }
    await router.push({ query })
  }

  async function applyFilters(newFilters: { search?: string }) {
    const query = { ...route.query }
    if (newFilters.search !== undefined) {
      if (newFilters.search) query.search = newFilters.search
      else delete query.search
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
      search.value = s
      await fetchClassrooms({ page: p, search: s })
    },
    { immediate: true, deep: true }
  )

  return {
    classrooms: items,
    loading,
    page,
    filters: computed(() => ({ search: search.value })),
    itemPerPage,
    totalCount,
    nextPage,
    previousPage,
    fetchClassrooms,
    gotoPage,
    applyFilters,
    
    // Mutations
    createClassroom: async (payload: any) => {
      const res = await store.createOne(payload)
      if (isSearchActive.value) await fetchClassrooms()
      return res
    },
    updateClassroom: async (id: string, payload: any) => {
      const res = await store.updateOne(id, payload)
      if (isSearchActive.value) await fetchClassrooms()
      return res
    },
    deleteClassroom: async (id: string) => {
      await store.deleteOne(id)
      if (isSearchActive.value) await fetchClassrooms()
    },
  }
}
