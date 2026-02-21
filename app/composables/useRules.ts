import type { Rule, RulePayload } from '~/types/api'
import { ruleService } from '~/services/rule.service'

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
  >((options) => ruleService.getRules($api, options))

  async function fetchRules(options?: {
    page?: number
  }) {
    await paginated.fetchPage(options)
  }

  async function createRule(data: RulePayload) {
    return await ruleService.createRule($api, data)
  }

  async function updateRule(id: string, body: RulePayload) {
    await ruleService.updateRule($api, id, body)
  }

  async function deleteRule(id: string) {
    await ruleService.deleteRule($api, id)
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
    createRule,
    updateRule,
    deleteRule,
  }
}
