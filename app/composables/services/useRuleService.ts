import type { Rule, PaginatedResponse, RulePayload as RuleCreateData } from '~/types/api'

export function useRuleService() {
  const { $api } = useNuxtApp()

  async function getRules(options?: { page?: number; search?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Rule>>('/rules', { params })
  }

  async function createRule(data: RuleCreateData) {
    return $api<Rule>('/rules', {
      method: 'POST',
      body: data,
    })
  }

  async function updateRule(ruleId: string, data: Partial<RuleCreateData>) {
    return $api<Rule>(`/rules/${ruleId}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteRule(ruleId: string): Promise<void> {
    await $api(`/rules/${ruleId}`, {
      method: 'DELETE',
    })
  }

  return {
    getRules,
    createRule,
    updateRule,
    deleteRule,
  }
}
