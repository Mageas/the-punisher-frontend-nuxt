import type { PaginatedResponse, Punishment } from '~/types/api'

type PunishmentSectionQueryValue = string | number | boolean | null | undefined
type PunishmentSectionQueryOptions = Record<string, PunishmentSectionQueryValue>

interface UsePunishmentsSectionOptions<TFilters extends PunishmentSectionQueryOptions> {
  source: (options?: TFilters & { page?: number }) => Promise<PaginatedResponse<Punishment>>
  filterKeys: (keyof TFilters & string)[]
  filterQueryKeys?: Partial<Record<keyof TFilters & string, string>>
  defaultFilters?: Partial<TFilters>
  stateKey: string
}

export function usePunishmentsSection<TFilters extends PunishmentSectionQueryOptions>(
  options: UsePunishmentsSectionOptions<TFilters>,
) {
  const paginated = usePaginatedCollection<Punishment, TFilters>(options.source, {
    pageKey: 'punishments_page',
    filterKeys: options.filterKeys,
    filterQueryKeys: options.filterQueryKeys,
    defaultFilters: options.defaultFilters,
    stateKey: options.stateKey,
  })

  async function fetchPunishments(overrideOptions?: Partial<TFilters> & { page?: number }) {
    await paginated.fetchPage(overrideOptions)
  }

  return {
    punishments: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchPunishments,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
  }
}
