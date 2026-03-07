import type { RuleDueAtMode, RuleMode, RulePayload } from '~/types/api'

export interface RuleFormValues {
  name: string
  resulting_punishment_type_id: string
  penalty_type_id: string
  threshold: number
  due_at_mode: RuleDueAtMode
  due_at_after_days: number | null
  due_at_after_lessons: number | null
  mode: RuleMode
}

export function buildRulePayload(values: RuleFormValues, isActive: boolean): RulePayload {
  const basePayload = {
    name: values.name,
    resulting_punishment_type_id: values.resulting_punishment_type_id,
    penalty_type_id: values.penalty_type_id,
    threshold: values.threshold,
    due_at_mode: values.due_at_mode,
    mode: values.mode,
    is_active: isActive,
  }

  if (values.due_at_mode === 'next_lessons') {
    return {
      ...basePayload,
      due_at_after_days: null,
      due_at_after_lessons: values.due_at_after_lessons,
    }
  }

  return {
    ...basePayload,
    due_at_after_days: values.due_at_after_days,
    due_at_after_lessons: null,
  }
}
