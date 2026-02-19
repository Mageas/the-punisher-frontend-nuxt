import type { Rule, RulePayload } from '~/types/api'
import { usePaginatedCollection } from '~/composables/usePaginatedCollection'

/**
 * Composable to fetch and manage rules with pagination.
 */
export function useRules() {
  const { $api } = useNuxtApp()
  const paginated = usePaginatedCollection<
    Rule,
    {
      page?: number
    }
  >('/rules/')

  async function fetchRules(options?: {
    page?: number
  }) {
    await paginated.fetchPage(options)
  }

  async function updateRule(id: string, body: RulePayload) {
    await $api<Rule>(`/rules/${id}`, {
      method: 'PUT',
      body,
    })
  }

  async function deleteRule(id: string) {
    await $api(`/rules/${id}`, { method: 'DELETE' })
  }

  return {
    rules: paginated.items,
    loading: paginated.loading,
    page: paginated.page,
    itemPerPage: paginated.itemPerPage,
    totalCount: paginated.totalCount,
    nextPage: paginated.nextPage,
    previousPage: paginated.previousPage,
    fetchRules,
    updateRule,
    deleteRule,
  }
}
