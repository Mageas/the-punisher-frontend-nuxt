import { describe, expect, it } from 'vitest'
import type { Rule } from '~/types/api'
import {
  buildRulePayload,
  buildRuleUpdatePayload,
  getGeneratedRuleName,
  getRuleFormInitialValues,
  resolveRuleFormName,
  RULE_NAME_MAX_LENGTH,
} from '../rule-form'

const baseRule: Rule = {
  id: 'rule-1',
  name: 'Retard -> Retenue',
  penalty_type_id: 'penalty-1',
  penalty_type_name: 'Retard',
  resulting_punishment_type_id: 'punishment-1',
  resulting_punishment_type_name: 'Retenue',
  threshold: 3,
  mode: 'at',
  due_at_mode: 'days',
  due_at_after_days: 7,
  due_at_after_lessons: null,
  is_active: true,
  created_at: '2026-03-07T10:00:00.000Z',
  updated_at: '2026-03-07T10:00:00.000Z',
}

describe('buildRulePayload', () => {
  it('only keeps due_at_after_days when the rule is day-based', () => {
    expect(
      buildRulePayload(
        {
          name: '3 retards = retenue',
          penalty_type_id: 'penalty-1',
          resulting_punishment_type_id: 'punishment-1',
          threshold: 3,
          mode: 'after',
          due_at_mode: 'days',
          due_at_after_days: 2,
          due_at_after_lessons: 4,
        },
        true,
      ),
    ).toEqual({
      name: '3 retards = retenue',
      penalty_type_id: 'penalty-1',
      resulting_punishment_type_id: 'punishment-1',
      threshold: 3,
      mode: 'after',
      due_at_mode: 'days',
      due_at_after_days: 2,
      is_active: true,
    })
  })

  it('only keeps due_at_after_lessons when the rule is next_lessons-based', () => {
    expect(
      buildRulePayload(
        {
          name: '3 retards = prochain cours',
          penalty_type_id: 'penalty-1',
          resulting_punishment_type_id: 'punishment-1',
          threshold: 3,
          mode: 'every',
          due_at_mode: 'next_lessons',
          due_at_after_days: 7,
          due_at_after_lessons: 2,
        },
        false,
      ),
    ).toEqual({
      name: '3 retards = prochain cours',
      penalty_type_id: 'penalty-1',
      resulting_punishment_type_id: 'punishment-1',
      threshold: 3,
      mode: 'every',
      due_at_mode: 'next_lessons',
      due_at_after_lessons: 2,
      is_active: false,
    })
  })

  it('returns the default create values when no rule is provided', () => {
    expect(getRuleFormInitialValues()).toEqual({
      name: '',
      penalty_type_id: '',
      resulting_punishment_type_id: '',
      threshold: 3,
      mode: 'at',
      due_at_mode: 'days',
      due_at_after_days: 7,
      due_at_after_lessons: null,
    })
  })

  it('builds the generated rule name and truncates custom names to the allowed length', () => {
    expect(getGeneratedRuleName('Retard', 'Retenue', 'Fallback')).toBe('Retard -> Retenue')
    expect(getGeneratedRuleName('', 'Retenue', 'Fallback')).toBe('Fallback')

    expect(resolveRuleFormName(undefined, 'Generated')).toBe('Generated')
    expect(resolveRuleFormName('x'.repeat(RULE_NAME_MAX_LENGTH + 5), 'Generated')).toHaveLength(
      RULE_NAME_MAX_LENGTH,
    )
  })

  it('builds a trimmed delta payload for edited rules', () => {
    expect(
      buildRuleUpdatePayload(baseRule, {
        ...getRuleFormInitialValues(baseRule),
        name: `  ${baseRule.name}  `,
        threshold: 5,
      }),
    ).toEqual({
      threshold: 5,
    })
  })

  it('keeps only the active due field in update payloads when switching modes', () => {
    expect(
      buildRuleUpdatePayload(baseRule, {
        ...getRuleFormInitialValues(baseRule),
        due_at_mode: 'next_lessons',
        due_at_after_days: null,
        due_at_after_lessons: 2,
      }),
    ).toEqual({
      due_at_mode: 'next_lessons',
      due_at_after_lessons: 2,
    })
  })
})
