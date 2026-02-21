import { createStaticPaginatedStore } from './_shared/createStaticPaginatedStore'
import { ruleService } from '~/services/rule.service'
import type { Rule } from '~/types/api'

export const useRulesStore = createStaticPaginatedStore<
  Rule,
  { search?: string }
>({
  id: 'rules',
  resource: 'rules',
  service: {
    list: (params) => ruleService.getRules(params),
    create: (payload) => ruleService.createRule(payload),
    update: (id, payload) => ruleService.updateRule(id, payload),
    delete: (id) => ruleService.deleteRule(id),
  },
  allowedStableFilterKeys: [],
  staleTimeMs: 30_000,
  maxCachedPages: 20,
})
