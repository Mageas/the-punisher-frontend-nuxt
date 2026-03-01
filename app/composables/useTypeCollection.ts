import type { PaginatedResponse } from '~/types/api'

export interface NamedTypeResource {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface TypeServiceFunctions<TType> {
  getTypes: (options?: { page?: number; search?: string }) => Promise<PaginatedResponse<TType>>
  createType: (data: { name: string }) => Promise<TType>
  updateType: (id: string, data: { name: string }) => Promise<TType>
  deleteType: (id: string) => Promise<void>
}

/**
 * Shared parent composable for type resources (penalty/punishment/bonus).
 */
export function useTypeCollection<TType extends NamedTypeResource>(
  services: TypeServiceFunctions<TType>,
  stateKey = 'paginated:types',
) {
  const paginated = usePaginatedCollection<TType, { page?: number; search?: string }>(
    (options) => services.getTypes(options),
    { pageKey: 'page', filterKeys: ['search'], stateKey },
  )

  async function fetchTypes(options?: { page?: number; search?: string }) {
    await paginated.fetchPage(options)
  }

  async function createType(name: string) {
    await services.createType({ name })
  }

  async function updateType(id: string, name: string) {
    await services.updateType(id, { name })
  }

  async function deleteType(id: string) {
    await services.deleteType(id)
  }

  return {
    types: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    filters: paginated.filters,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchTypes,
    gotoPage: paginated.gotoPage,
    applyFilters: paginated.applyFilters,
    createType,
    updateType,
    deleteType,
  }
}
