import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useRuleDetails } from '../useRuleDetails'
import type { Rule } from '~/types/api'

const mockRuleService = {
  getRule: vi.fn(),
}

vi.mock('../services/useRuleService', () => ({
  useRuleService: () => mockRuleService,
}))

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve,
    reject,
  }
}

function createRule(id: string, overrides: Partial<Rule> = {}): Rule {
  return {
    id,
    name: `Rule ${id}`,
    resulting_punishment_type_id: 'punishment-type-1',
    resulting_punishment_type_name: 'Retention',
    penalty_type_id: 'penalty-type-1',
    penalty_type_name: 'Talking',
    threshold: 3,
    due_at_mode: 'days',
    due_at_after_days: 2,
    due_at_after_lessons: null,
    mode: 'at',
    is_active: true,
    created_at: '2026-03-13T10:00:00Z',
    updated_at: '2026-03-13T10:00:00Z',
    ...overrides,
  }
}

async function flushPromises() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('useRuleDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('hydrates the selected rule from the current list before the API response resolves', async () => {
    const deferred = createDeferred<Rule>()
    const currentRules = ref([createRule('rule-1', { name: 'Rule from list' })])
    mockRuleService.getRule.mockReturnValue(deferred.promise)

    const { selectedRule, loadingSelectedRule, loadRule } = useRuleDetails({
      initialRules: currentRules,
    })

    const loadPromise = loadRule('rule-1')

    expect(selectedRule.value?.name).toBe('Rule from list')
    expect(loadingSelectedRule.value).toBe(true)

    deferred.resolve(createRule('rule-1', { name: 'Rule from api' }))
    await loadPromise

    expect(mockRuleService.getRule).toHaveBeenCalledWith('rule-1')
    expect(selectedRule.value?.name).toBe('Rule from api')
    expect(loadingSelectedRule.value).toBe(false)
  })

  it('ignores stale responses when a newer rule request finishes first', async () => {
    const firstRequest = createDeferred<Rule>()
    const secondRequest = createDeferred<Rule>()

    mockRuleService.getRule.mockImplementation((ruleId: string) => {
      if (ruleId === 'rule-1') return firstRequest.promise
      return secondRequest.promise
    })

    const { selectedRule, loadingSelectedRule, loadRule } = useRuleDetails()

    const firstLoad = loadRule('rule-1')
    const secondLoad = loadRule('rule-2')

    secondRequest.resolve(createRule('rule-2'))
    await secondLoad

    expect(selectedRule.value?.id).toBe('rule-2')
    expect(loadingSelectedRule.value).toBe(false)

    firstRequest.resolve(createRule('rule-1'))
    await firstLoad
    await flushPromises()

    expect(selectedRule.value?.id).toBe('rule-2')
  })

  it('clears the selected rule and cancels the visible effect of an in-flight request', async () => {
    const deferred = createDeferred<Rule>()
    mockRuleService.getRule.mockReturnValue(deferred.promise)

    const { selectedRule, loadingSelectedRule, loadRule, clearSelectedRule } = useRuleDetails({
      initialRules: ref([createRule('rule-1')]),
    })

    const loadPromise = loadRule('rule-1')
    clearSelectedRule()

    expect(selectedRule.value).toBeNull()
    expect(loadingSelectedRule.value).toBe(false)

    deferred.resolve(createRule('rule-1', { name: 'Late response' }))
    await loadPromise

    expect(selectedRule.value).toBeNull()
    expect(loadingSelectedRule.value).toBe(false)
  })

  it('rethrows service errors after clearing the selected rule', async () => {
    const serviceError = new Error('Request failed')
    mockRuleService.getRule.mockRejectedValue(serviceError)

    const { selectedRule, loadingSelectedRule, loadRule } = useRuleDetails({
      initialRules: ref([createRule('rule-1')]),
    })

    await expect(loadRule('rule-1')).rejects.toThrow('Request failed')

    expect(selectedRule.value).toBeNull()
    expect(loadingSelectedRule.value).toBe(false)
  })
})
