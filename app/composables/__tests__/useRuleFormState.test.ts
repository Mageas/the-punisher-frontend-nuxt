import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
import type { Rule } from '~/types/api'
import { useRuleFormState } from '../useRuleFormState'

const translations: Record<string, string> = {
  'rules.modes.at': 'Au seuil exact',
  'rules.modes.every': 'A chaque multiple',
  'rules.modes.after': 'A partir de',
  'rules.dueModes.days': 'Jours',
  'rules.dueModes.next_lessons': 'Prochains cours',
}

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}))

function createRuleFormState(
  initialValues: Partial<{
    due_at_mode: 'days' | 'next_lessons'
    due_at_after_days: number | null
    due_at_after_lessons: number | null
  }> = {},
) {
  const values = reactive({
    due_at_mode: 'days' as const,
    due_at_after_days: 7 as number | null,
    due_at_after_lessons: null as number | null,
    ...initialValues,
  })
  const setFieldValue = vi.fn(
    (
      field: 'due_at_after_days' | 'due_at_after_lessons',
      value: number | null,
      _shouldValidate?: boolean,
    ) => {
      values[field] = value
    },
  )

  const ruleFormState = useRuleFormState({
    values,
    setFieldValue,
  })

  return {
    values,
    setFieldValue,
    ruleFormState,
  }
}

describe('useRuleFormState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns translated options and form defaults', () => {
    const rule: Rule = {
      id: 'rule-1',
      name: 'Retard -> Retenue',
      penalty_type_id: 'penalty-1',
      penalty_type_name: 'Retard',
      resulting_punishment_type_id: 'punishment-1',
      resulting_punishment_type_name: 'Retenue',
      threshold: 4,
      mode: 'after',
      due_at_mode: 'next_lessons',
      due_at_after_days: null,
      due_at_after_lessons: 2,
      is_active: true,
      created_at: '2026-03-07T10:00:00.000Z',
      updated_at: '2026-03-07T10:00:00.000Z',
    }
    const { ruleFormState } = createRuleFormState()

    expect(ruleFormState.modeOptions.value).toEqual([
      { id: 'at', name: 'Au seuil exact' },
      { id: 'every', name: 'A chaque multiple' },
      { id: 'after', name: 'A partir de' },
    ])
    expect(ruleFormState.dueAtModeOptions.value).toEqual([
      { id: 'days', name: 'Jours' },
      { id: 'next_lessons', name: 'Prochains cours' },
    ])
    expect(ruleFormState.getInitialValues()).toEqual({
      name: '',
      penalty_type_id: '',
      resulting_punishment_type_id: '',
      threshold: 3,
      mode: 'at',
      due_at_mode: 'days',
      due_at_after_days: 7,
      due_at_after_lessons: null,
    })
    expect(ruleFormState.getInitialValues(rule)).toEqual({
      name: 'Retard -> Retenue',
      penalty_type_id: 'penalty-1',
      resulting_punishment_type_id: 'punishment-1',
      threshold: 4,
      mode: 'after',
      due_at_mode: 'next_lessons',
      due_at_after_days: 7,
      due_at_after_lessons: 2,
    })
  })

  it('keeps due fields in sync when switching the due_at mode', async () => {
    const { values, setFieldValue } = createRuleFormState({
      due_at_after_days: null,
      due_at_after_lessons: null,
    })

    values.due_at_mode = 'next_lessons'
    await nextTick()

    expect(setFieldValue).toHaveBeenNthCalledWith(1, 'due_at_after_lessons', 1, false)
    expect(setFieldValue).toHaveBeenNthCalledWith(2, 'due_at_after_days', null, false)

    values.due_at_mode = 'days'
    await nextTick()

    expect(setFieldValue).toHaveBeenNthCalledWith(3, 'due_at_after_days', 7, false)
    expect(setFieldValue).toHaveBeenNthCalledWith(4, 'due_at_after_lessons', null, false)
  })
})
