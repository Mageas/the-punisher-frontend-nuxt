import type { PaginatedResponse, Penalty } from '~/types/api'

type PenaltySectionQueryValue = string | number | boolean | null | undefined
type PenaltySectionQueryOptions = Record<string, PenaltySectionQueryValue>

interface UsePenaltiesSectionOptions<TFilters extends PenaltySectionQueryOptions> {
  source: (options?: TFilters & { page?: number }) => Promise<PaginatedResponse<Penalty>>
  filterKeys: (keyof TFilters & string)[]
  defaultFilters?: Partial<TFilters>
  stateKey: string
}

export function usePenaltiesSection<TFilters extends PenaltySectionQueryOptions>(
  options: UsePenaltiesSectionOptions<TFilters>,
) {
  const paginated = usePaginatedCollection<Penalty, TFilters>(options.source, {
    pageKey: 'penalties_page',
    filterKeys: options.filterKeys,
    defaultFilters: options.defaultFilters,
    stateKey: options.stateKey,
  })

  async function fetchPenalties(overrideOptions?: Partial<TFilters> & { page?: number }) {
    await paginated.fetchPage(overrideOptions)
  }

  return {
    penalties: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPenalties,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
  }
}
