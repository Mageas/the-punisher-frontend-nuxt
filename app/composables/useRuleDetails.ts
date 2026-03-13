import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import type { Rule } from '~/types/api'

interface UseRuleDetailsOptions {
  initialRules?: MaybeRefOrGetter<Rule[] | null | undefined>
}

export function useRuleDetails(options: UseRuleDetailsOptions = {}) {
  const ruleService = useRuleService()

  const selectedRule = ref<Rule | null>(null)
  const loadingSelectedRule = ref(false)

  let latestRequestId = 0

  function resolveInitialRule(ruleId: string) {
    const initialRules = toValue(options.initialRules) || []
    return initialRules.find((rule) => rule.id === ruleId) ?? null
  }

  function clearSelectedRule() {
    latestRequestId += 1
    selectedRule.value = null
    loadingSelectedRule.value = false
  }

  async function loadRule(ruleId: string) {
    const requestId = ++latestRequestId
    loadingSelectedRule.value = true

    const initialRule = resolveInitialRule(ruleId)
    if (initialRule) {
      selectedRule.value = initialRule
    }

    try {
      const fetchedRule = await ruleService.getRule(ruleId)

      if (requestId !== latestRequestId) return null

      selectedRule.value = fetchedRule
      return fetchedRule
    } catch (error) {
      if (requestId !== latestRequestId) return null

      selectedRule.value = null
      throw error
    } finally {
      if (requestId === latestRequestId) {
        loadingSelectedRule.value = false
      }
    }
  }

  return {
    selectedRule: readonly(selectedRule),
    loadingSelectedRule: readonly(loadingSelectedRule),
    loadRule,
    clearSelectedRule,
  }
}
