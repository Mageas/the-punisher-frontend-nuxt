import { computed, watch } from 'vue'
import {
  getRuleFormInitialValues,
  RULE_DUE_AT_AFTER_DAYS_DEFAULT,
  RULE_DUE_AT_AFTER_LESSONS_DEFAULT,
} from '~/lib/rule-form'
import type { RuleFormValues } from '~/lib/rule-form'
import type { Rule, RuleDueAtMode, RuleMode } from '~/types/api'

interface RuleSelectOption<T extends string> {
  id: T
  name: string
}

interface UseRuleFormStateOptions {
  values: Pick<RuleFormValues, 'due_at_mode' | 'due_at_after_days' | 'due_at_after_lessons'>
  setFieldValue: (
    field: 'due_at_after_days' | 'due_at_after_lessons',
    value: number | null,
    shouldValidate?: boolean,
  ) => void
}

export function useRuleFormState(options: UseRuleFormStateOptions) {
  const { t } = useI18n()

  const modeOptions = computed<RuleSelectOption<RuleMode>[]>(() => [
    { id: 'at', name: t('rules.modes.at') },
    { id: 'every', name: t('rules.modes.every') },
    { id: 'after', name: t('rules.modes.after') },
  ])

  const dueAtModeOptions = computed<RuleSelectOption<RuleDueAtMode>[]>(() => [
    { id: 'days', name: t('rules.dueModes.days') },
    { id: 'next_lessons', name: t('rules.dueModes.next_lessons') },
  ])

  watch(
    () => options.values.due_at_mode,
    (dueAtMode) => {
      if (dueAtMode === 'next_lessons') {
        if (options.values.due_at_after_lessons === null) {
          options.setFieldValue('due_at_after_lessons', RULE_DUE_AT_AFTER_LESSONS_DEFAULT, false)
        }

        options.setFieldValue('due_at_after_days', null, false)
        return
      }

      if (options.values.due_at_after_days === null) {
        options.setFieldValue('due_at_after_days', RULE_DUE_AT_AFTER_DAYS_DEFAULT, false)
      }

      options.setFieldValue('due_at_after_lessons', null, false)
    },
  )

  function getInitialValues(rule?: Rule | null): RuleFormValues {
    return getRuleFormInitialValues(rule)
  }

  return {
    modeOptions,
    dueAtModeOptions,
    getInitialValues,
  }
}
