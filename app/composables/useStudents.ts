import { storeToRefs } from 'pinia'
import { markRaw, ref, reactive, computed, watch } from 'vue'
import { useStudentsStore } from '~/stores/students.store'
import { studentService } from '~/services/student.service'
import type { Student } from '~/types/api'

/**
 * Composable to fetch and manage students with pagination.
 * - Uses `students.store` for cached standard lists.
 * - Uses local state for volatile search results.
 */
export function useStudents() {
  const store = useStudentsStore()
  const route = useRoute()
  const router = useRouter()

  // -- Store State --
  // We use storeToRefs to keep reactivity but we'll merge with local state
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
  const searchResults = ref<Student[]>([])
  const searchLoading = ref(false)
  const searchPagination = reactive({
    page: 1,
    totalCount: 0,
    itemPerPage: 0,
    nextPage: null as number | null,
    previousPage: null as number | null,
  })
  
  // Track search request to ignore stale responses
  let lastSearchId = 0

  // Computed: Active Mode
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
  async function fetchStudents(options?: { page?: number; search?: string; force?: boolean }) {
    const p = options?.page ?? (isSearchActive.value ? searchPagination.page : storePage.value)
    const s = options?.search ?? search.value
    const force = options?.force ?? false

    if (s.trim().length > 0) {
      // >> SEARCH MODE (Local, Volatile)
      searchLoading.value = true
      const currentId = ++lastSearchId
      
      try {
        // Always fetch fresh search results (no cache for search here anyway)
        const res = await studentService.getStudents({ page: p, search: s })
        
        // Race condition check
        if (currentId === lastSearchId) {
          searchResults.value = markRaw(res.data)
          searchPagination.page = res.page
          searchPagination.totalCount = res.total_count
          searchPagination.itemPerPage = res.item_per_page
          searchPagination.nextPage = res.next_page
          searchPagination.previousPage = res.previous_page
        }
      } catch (err: any) {
        if (currentId === lastSearchId) {
          // Handle error (maybe clear results or show error)
          console.error('Search failed', err)
          searchResults.value = []
        }
      } finally {
        if (currentId === lastSearchId) {
          searchLoading.value = false
        }
      }
    } else {
      // >> STANDARD MODE (Store, Cached)
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
    
    // Reset to page 1 on filter change
    query.page = '1'
    
    await router.push({ query })
  }

  // -- URL Sync --
  // Watch URL changes to trigger fetch
  watch(
    () => route.query,
    async (newQuery) => {
      const p = Number(newQuery.page) || 1
      const s = String(newQuery.search || '')
      
      search.value = s
      
      await fetchStudents({ page: p, search: s })
    },
    { immediate: true, deep: true }
  )

  return {
    students: items,
    loading,
    page,
    filters: computed(() => ({ search: search.value })),
    itemPerPage,
    totalCount,
    nextPage,
    previousPage,
    
    fetchStudents,
    gotoPage,
    applyFilters,
    
    createStudent: async (payload: any) => {
      const res = await store.createOne(payload)
      if (isSearchActive.value) await fetchStudents()
      return res
    },
    updateStudent: async (id: string, payload: any) => {
      const res = await store.updateOne(id, payload)
      if (isSearchActive.value) await fetchStudents()
      return res
    },
    deleteStudent: async (id: string) => {
      await store.deleteOne(id)
      if (isSearchActive.value) await fetchStudents()
    },
  }
}
