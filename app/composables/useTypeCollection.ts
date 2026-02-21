import type { PaginatedResponse } from '~/types/api'

export interface NamedTypeResource {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface TypeServiceFunctions<TType> {
  getTypes: (options?: { page?: number }) => Promise<PaginatedResponse<TType>>
  createType: (data: { name: string }) => Promise<TType>
  updateType: (id: string, data: { name: string }) => Promise<TType>
  deleteType: (id: string) => Promise<void>
}

/**
 * Shared parent composable for type resources (penalty/punishment/bonus).
 */
export function useTypeCollection<TType extends NamedTypeResource>(
  services: TypeServiceFunctions<TType>,
) {
  const paginated = usePaginatedCollection<TType, { page?: number }>((options) =>
    services.getTypes(options),
  )

  async function fetchTypes(options?: { page?: number }) {
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
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchTypes,
    createType,
    updateType,
    deleteType,
  }
}
