import { describe, expect, it } from 'vitest'
import { buildRulePayload } from '../rule-form'

describe('buildRulePayload', () => {
  it('nulls due_at_after_lessons when the rule is day-based', () => {
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
      due_at_after_lessons: null,
      is_active: true,
    })
  })

  it('nulls due_at_after_days when the rule is next_lessons-based', () => {
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
      due_at_after_days: null,
      due_at_after_lessons: 2,
      is_active: false,
    })
  })
})
