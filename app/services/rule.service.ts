import type { Rule, PaginatedResponse, RulePayload as RuleCreateData, $Fetch } from '~/types/api'

export const ruleService = {
  async getRules($api: $Fetch, options?: { page?: number; search?: string }) {
    const params: Record<string, unknown> = {}
    if (options?.page) params.page = options.page
    if (options?.search) params.search = options.search
    return $api<PaginatedResponse<Rule>>('/rules', { params })
  },

  async createRule($api: $Fetch, data: RuleCreateData) {
    return $api<Rule>('/rules', {
      method: 'POST',
      body: data,
    })
  },

  async updateRule($api: $Fetch, ruleId: string, data: Partial<RuleCreateData>) {
    return $api<Rule>(`/rules/${ruleId}`, {
      method: 'PUT',
      body: data,
    })
  },

  async deleteRule($api: $Fetch, ruleId: string): Promise<void> {
    await $api(`/rules/${ruleId}`, {
      method: 'DELETE',
    })
  }
}
