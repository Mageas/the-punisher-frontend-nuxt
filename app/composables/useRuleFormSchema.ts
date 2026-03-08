import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import {
  RULE_DUE_AT_AFTER_DAYS_MIN,
  RULE_DUE_AT_AFTER_LESSONS_MAX,
  RULE_DUE_AT_AFTER_LESSONS_MIN,
  RULE_NAME_MAX_LENGTH,
  RULE_THRESHOLD_MIN,
} from '~/lib/rule-form'

interface UseRuleFormSchemaOptions {
  allowEmptyName?: boolean
}

export function useRuleFormSchema(options: UseRuleFormSchemaOptions = {}) {
  const { t } = useI18n()

  const nullableDueField = (min: number, max?: number) =>
    zod.preprocess(
      (value) => {
        if (value === '' || value === null || typeof value === 'undefined') {
          return null
        }

        return Number(value)
      },
      (typeof max === 'number'
        ? zod
            .number()
            .min(min, t('apiErrors.details.validation_min_length', { value: min }))
            .max(max, t('apiErrors.details.validation_max_length', { value: max }))
        : zod.number().min(min, t('apiErrors.details.validation_min_length', { value: min }))
      ).nullable(),
    )

  const nameField = options.allowEmptyName
    ? zod
        .string()
        .max(
          RULE_NAME_MAX_LENGTH,
          t('apiErrors.details.validation_max_length', { value: RULE_NAME_MAX_LENGTH }),
        )
        .refine((value) => value.trim().length === 0 || value.trim().length >= 2, {
          message: t('apiErrors.details.validation_min_length', { value: 2 }),
        })
    : zod
        .string()
        .min(2, t('apiErrors.details.validation_min_length', { value: 2 }))
        .max(
          RULE_NAME_MAX_LENGTH,
          t('apiErrors.details.validation_max_length', { value: RULE_NAME_MAX_LENGTH }),
        )

  return toTypedSchema(
    zod
      .object({
        name: nameField,
        penalty_type_id: zod.string().min(1, t('apiErrors.details.validation_field_required')),
        resulting_punishment_type_id: zod
          .string()
          .min(1, t('apiErrors.details.validation_field_required')),
        threshold: zod.coerce
          .number()
          .min(
            RULE_THRESHOLD_MIN,
            t('apiErrors.details.validation_min_length', { value: RULE_THRESHOLD_MIN }),
          ),
        mode: zod.enum(['at', 'every', 'after'] as const),
        due_at_mode: zod.enum(['days', 'next_lessons'] as const),
        due_at_after_days: nullableDueField(RULE_DUE_AT_AFTER_DAYS_MIN),
        due_at_after_lessons: nullableDueField(
          RULE_DUE_AT_AFTER_LESSONS_MIN,
          RULE_DUE_AT_AFTER_LESSONS_MAX,
        ),
      })
      .superRefine((value, ctx) => {
        if (value.due_at_mode === 'days' && value.due_at_after_days === null) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            path: ['due_at_after_days'],
            message: t('apiErrors.details.validation_field_required'),
          })
        }

        if (value.due_at_mode === 'next_lessons' && value.due_at_after_lessons === null) {
          ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            path: ['due_at_after_lessons'],
            message: t('apiErrors.details.validation_field_required'),
          })
        }
      }),
  )
}
