import type { Rule, PaginatedResponse, RulePayload as RuleCreateData } from '~/types/api'

export const ruleService = {
  async getRules(options?: { page?: number; search?: string }) {
    const { $api } = useNuxtApp()
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Rule>>('/rules', { params })
  },

  async createRule(data: RuleCreateData) {
    const { $api } = useNuxtApp()
    return $api<Rule>('/rules', {
      method: 'POST',
      body: data,
    })
  },

  async updateRule(ruleId: string, data: Partial<RuleCreateData>) {
    const { $api } = useNuxtApp()
    return $api<Rule>(`/rules/${ruleId}`, {
      method: 'PUT',
      body: data,
    })
  },

  async deleteRule(ruleId: string): Promise<void> {
    const { $api } = useNuxtApp()
    await $api(`/rules/${ruleId}`, {
      method: 'DELETE',
    })
  },
}
