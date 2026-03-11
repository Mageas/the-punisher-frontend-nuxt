import type { PaginatedResponse, Bonus } from '~/types/api'

type BonusSectionQueryValue = string | number | boolean | null | undefined
type BonusSectionQueryOptions = Record<string, BonusSectionQueryValue>

interface UseBonusesSectionOptions<TFilters extends BonusSectionQueryOptions> {
  source: (options?: TFilters & { page?: number }) => Promise<PaginatedResponse<Bonus>>
  filterKeys: (keyof TFilters & string)[]
  defaultFilters?: Partial<TFilters>
  stateKey: string
}

export function useBonusesSection<TFilters extends BonusSectionQueryOptions>(
  options: UseBonusesSectionOptions<TFilters>,
) {
  const paginated = usePaginatedCollection<Bonus, TFilters>(options.source, {
    pageKey: 'bonuses_page',
    filterKeys: options.filterKeys,
    defaultFilters: options.defaultFilters,
    stateKey: options.stateKey,
  })

  async function fetchBonuses(overrideOptions?: Partial<TFilters> & { page?: number }) {
    await paginated.fetchPage(overrideOptions)
  }

  return {
    bonuses: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchBonuses,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
  }
}
