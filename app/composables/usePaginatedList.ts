import type { PaginatedResponse } from "@/types/api"

type UsePaginatedListOptions = {
  page?: number
  itemsPerPage?: number
  syncUrl?: boolean
}

export function usePaginatedList<T>(
  url: string | (() => string),
  options: UsePaginatedListOptions = {},
) {
  const { syncUrl = true } = options
  const apiClient = useApiClient()
  const route = useRoute()
  const router = useRouter()

  const localPage = ref(options.page ?? 1)

  const currentPage = computed({
    get: () => {
      if (!syncUrl) {
        return localPage.value
      }
      const page = Number(route.query.page)
      return Number.isNaN(page) || page < 1 ? 1 : page
    },
    set: (value: number) => {
      if (!syncUrl) {
        localPage.value = value
        return
      }
      router.push({ query: { ...route.query, page: value } })
    },
  })

  const {
    data: response,
    isLoading,
    error,
    execute,
  } = useRequestState<PaginatedResponse<T>>()

  const items = computed(() => response.value?.data ?? [])
  const totalCount = computed(() => response.value?.total_count ?? 0)
  const itemsPerPage = computed(() => response.value?.item_per_page ?? 20)
  const previousPage = computed(() => response.value?.previous_page ?? null)
  const nextPage = computed(() => response.value?.next_page ?? null)

  const hasPrevious = computed(() => previousPage.value !== null)
  const hasNext = computed(() => nextPage.value !== null)

  const load = async () => {
    await execute(async () => {
      const targetUrl = typeof url === "function" ? url() : url
      if (!targetUrl) {
        return {
          data: [],
          page: 1,
          item_per_page: options.itemsPerPage ?? 20,
          total_count: 0,
          previous_page: null,
          next_page: null,
        }
      }

      return await apiClient.apiFetch<PaginatedResponse<T>>(targetUrl, {
        query: {
          page: currentPage.value,
          limit: options.itemsPerPage,
        },
      })
    })
  }

  // Watch for page changes in URL
  watch(currentPage, () => {
    load()
  })

  // Initial load if not triggered manually (can be added as an option)
  onMounted(() => {
    load()
  })

  return {
    items,
    currentPage,
    itemsPerPage,
    totalCount,
    previousPage,
    nextPage,
    hasPrevious,
    hasNext,
    isLoading,
    error,
    load,
  }
}
