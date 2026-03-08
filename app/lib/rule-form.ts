import { buildDelta } from '~/lib/delta'
import type { Rule, RuleDueAtMode, RuleMode, RulePayload } from '~/types/api'

export const RULE_NAME_MAX_LENGTH = 120
export const RULE_THRESHOLD_DEFAULT = 3
export const RULE_THRESHOLD_MIN = 1
export const RULE_DUE_AT_AFTER_DAYS_DEFAULT = 7
export const RULE_DUE_AT_AFTER_DAYS_MIN = 0
export const RULE_DUE_AT_AFTER_LESSONS_DEFAULT = 1
export const RULE_DUE_AT_AFTER_LESSONS_MIN = 1
export const RULE_DUE_AT_AFTER_LESSONS_MAX = 5

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

type RuleFormSource = Pick<
  Rule,
  | 'name'
  | 'resulting_punishment_type_id'
  | 'penalty_type_id'
  | 'threshold'
  | 'due_at_mode'
  | 'due_at_after_days'
  | 'due_at_after_lessons'
  | 'mode'
>

export function getRuleFormInitialValues(rule?: RuleFormSource | null): RuleFormValues {
  return {
    name: rule?.name ?? '',
    penalty_type_id: rule?.penalty_type_id ?? '',
    resulting_punishment_type_id: rule?.resulting_punishment_type_id ?? '',
    threshold: rule?.threshold ?? RULE_THRESHOLD_DEFAULT,
    mode: rule?.mode ?? 'at',
    due_at_mode: rule?.due_at_mode ?? 'days',
    due_at_after_days: rule?.due_at_after_days ?? RULE_DUE_AT_AFTER_DAYS_DEFAULT,
    due_at_after_lessons: rule?.due_at_after_lessons ?? null,
  }
}

export function getGeneratedRuleName(
  penaltyTypeName: string,
  punishmentTypeName: string,
  fallbackName: string,
): string {
  if (penaltyTypeName && punishmentTypeName) {
    return `${penaltyTypeName} -> ${punishmentTypeName}`
  }

  return fallbackName
}

export function resolveRuleFormName(customName: string | null | undefined, generatedName: string) {
  const trimmedName = customName?.trim() ?? ''
  return (trimmedName || generatedName).slice(0, RULE_NAME_MAX_LENGTH)
}

function getRequiredRuleDueValue(
  value: number | null,
  field: 'due_at_after_days' | 'due_at_after_lessons',
) {
  if (value === null) {
    throw new Error(`Rule payload requires "${field}" when its mode is selected.`)
  }

  return value
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
      due_at_after_lessons: getRequiredRuleDueValue(
        values.due_at_after_lessons,
        'due_at_after_lessons',
      ),
    }
  }

  return {
    ...basePayload,
    due_at_after_days: getRequiredRuleDueValue(values.due_at_after_days, 'due_at_after_days'),
  }
}

export function buildRuleUpdatePayload(rule: Rule, values: RuleFormValues): Partial<RulePayload> {
  const initialPayload = buildRulePayload(getRuleFormInitialValues(rule), rule.is_active)
  const currentPayload = buildRulePayload(
    {
      ...values,
      name: values.name.trim(),
    },
    rule.is_active,
  )

  return buildDelta(initialPayload, currentPayload)
}
