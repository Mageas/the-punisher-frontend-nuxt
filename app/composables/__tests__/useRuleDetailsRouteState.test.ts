import { describe, it, expect, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import { buildRuleDetailsQuery, useRuleDetailsRouteState } from '../useRuleDetailsRouteState'

describe('useRuleDetailsRouteState', () => {
  it('builds a query that preserves existing params while setting ruleId', () => {
    expect(buildRuleDetailsQuery({ page: '2' }, 'rule-1')).toEqual({
      page: '2',
      ruleId: 'rule-1',
    })
  })

  it('builds a query that removes only ruleId when closing the details modal', () => {
    expect(buildRuleDetailsQuery({ page: '2', ruleId: 'rule-1' }, null)).toEqual({
      page: '2',
    })
  })

  it('tracks the selected rule id and syncs open/close navigation actions', async () => {
    const route = reactive({
      query: {
        page: '3',
        ruleId: 'rule-1',
      },
    })
    const router = {
      push: vi.fn().mockResolvedValue(undefined),
      replace: vi.fn().mockResolvedValue(undefined),
    }

    const { selectedRuleId, openRuleDetails, closeRuleDetails } = useRuleDetailsRouteState(
      route as never,
      router as never,
    )

    expect(selectedRuleId.value).toBe('rule-1')

    route.query.ruleId = 'rule-2'
    await nextTick()

    expect(selectedRuleId.value).toBe('rule-2')

    await openRuleDetails('rule-3')
    expect(router.push).toHaveBeenCalledWith({
      query: {
        page: '3',
        ruleId: 'rule-3',
      },
    })

    await closeRuleDetails()
    expect(router.replace).toHaveBeenCalledWith({
      query: {
        page: '3',
      },
    })
  })
})
