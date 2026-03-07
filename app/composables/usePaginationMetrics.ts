import type { Ref } from 'vue'
import { computeTotalPages } from '~/lib/kpi-formatters'

interface PaginationMetricsOptions {
  itemPerPage: Readonly<Ref<number>>
  totalCount: Readonly<Ref<number>>
  fallbackItemsPerPage?: number
}

export function usePaginationMetrics(options: PaginationMetricsOptions) {
  const safeItemsPerPage = computed(
    () => options.itemPerPage.value || options.fallbackItemsPerPage || 10,
  )
  const totalPages = computed(() =>
    computeTotalPages(options.totalCount.value, safeItemsPerPage.value),
  )
  const showPagination = computed(() => options.totalCount.value > 0)

  return {
    safeItemsPerPage,
    totalPages,
    showPagination,
  }
}
