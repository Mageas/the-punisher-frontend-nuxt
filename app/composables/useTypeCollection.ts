import { usePaginatedCollection } from '~/composables/usePaginatedCollection'

interface NamedTypeResource {
  id: string
  name: string
  created_at: string
  updated_at: string
}

/**
 * Shared parent composable for type resources (penalty/punishment/bonus).
 */
export function useTypeCollection<TType extends NamedTypeResource>(endpoint: string) {
  const { $api } = useNuxtApp()
  const paginated = usePaginatedCollection<TType, { page?: number }>(endpoint)

  async function fetchTypes(options?: { page?: number }) {
    await paginated.fetchPage(options)
  }

  async function createType(name: string) {
    await $api(endpoint, {
      method: 'POST',
      body: { name },
    })
  }

  async function updateType(id: string, name: string) {
    await $api(`${endpoint}${id}`, {
      method: 'PUT',
      body: { name },
    })
  }

  async function deleteType(id: string) {
    await $api(`${endpoint}${id}/force`, { method: 'DELETE' })
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
