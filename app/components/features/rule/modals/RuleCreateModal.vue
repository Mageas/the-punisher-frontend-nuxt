<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { RuleDueAtMode, RuleMode } from '~/types/api'
import { buildRulePayload } from '~/lib/rule-form'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const ruleService = useRuleService()
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

const schema = toTypedSchema(
  zod
    .object({
      name: zod
        .string()
        .max(120, t('apiErrors.details.validation_max_length', { value: 120 }))
        .refine((value) => value.trim().length === 0 || value.trim().length >= 2, {
          message: t('apiErrors.details.validation_min_length', { value: 2 }),
        }),
      penalty_type_id: zod.string().min(1, t('apiErrors.details.validation_field_required')),
      resulting_punishment_type_id: zod
        .string()
        .min(1, t('apiErrors.details.validation_field_required')),
      threshold: zod.coerce
        .number()
        .min(1, t('apiErrors.details.validation_min_length', { value: 1 })),
      mode: zod.enum(['at', 'every', 'after'] as const),
      due_at_mode: zod.enum(['days', 'next_lessons'] as const),
      due_at_after_days: nullableDueField(0),
      due_at_after_lessons: nullableDueField(1, 5),
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

const { handleSubmit, isSubmitting, resetForm, setFieldError, setFieldValue, values, meta } =
  useForm({
    validationSchema: schema,
    initialValues: {
      name: '',
      penalty_type_id: '',
      resulting_punishment_type_id: '',
      threshold: 3,
      mode: 'at' as RuleMode,
      due_at_mode: 'days' as RuleDueAtMode,
      due_at_after_days: 7,
      due_at_after_lessons: null as number | null,
    },
  })

const selectedPenaltyTypeName = ref('')
const selectedPunishmentTypeName = ref('')
const modeOptions = computed(() => [
  { id: 'at', name: t('rules.modes.at') },
  { id: 'every', name: t('rules.modes.every') },
  { id: 'after', name: t('rules.modes.after') },
])
const dueAtModeOptions = computed(() => [
  { id: 'days', name: t('rules.dueModes.days') },
  { id: 'next_lessons', name: t('rules.dueModes.next_lessons') },
])

const generatedRuleName = computed(() => {
  if (selectedPenaltyTypeName.value && selectedPunishmentTypeName.value) {
    return `${selectedPenaltyTypeName.value} -> ${selectedPunishmentTypeName.value}`
  }
  return t('rules.defaultName')
})

watch(open, async (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetForm({
      values: {
        name: '',
        penalty_type_id: '',
        resulting_punishment_type_id: '',
        threshold: 3,
        mode: 'at',
        due_at_mode: 'days',
        due_at_after_days: 7,
        due_at_after_lessons: null,
      },
    })
    selectedPenaltyTypeName.value = ''
    selectedPunishmentTypeName.value = ''
  }
})

watch(
  () => values.due_at_mode,
  (dueAtMode) => {
    if (dueAtMode === 'next_lessons') {
      if (values.due_at_after_lessons === null) {
        setFieldValue('due_at_after_lessons', 1, false)
      }
      setFieldValue('due_at_after_days', null, false)
      return
    }

    if (values.due_at_after_days === null) {
      setFieldValue('due_at_after_days', 7, false)
    }
    setFieldValue('due_at_after_lessons', null, false)
  },
)

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  try {
    const customName = formValues.name?.trim() ?? ''
    const resolvedName = (customName || generatedRuleName.value).substring(0, 120)

    await ruleService.createRule(buildRulePayload({ ...formValues, name: resolvedName }, true))
    open.value = false
    emit('created')
  } catch (err) {
    setFormErrors(setFieldError, err)
  }
})
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="t('modals.rule.title')"
    :global-error="globalError"
    :submitting="isSubmitting"
    :can-submit="meta.valid"
    :submit-text="t('common.actions.create')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>{{ t('modals.rule.name') }}</FormLabel>
        <FormControl>
          <Input
            v-bind="componentField"
            type="text"
            :placeholder="t('modals.rule.namePlaceholder')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ value, handleChange }" name="penalty_type_id">
      <FormItem>
        <FormLabel>{{ t('modals.rule.penaltyType') }}</FormLabel>
        <FormControl>
          <PenaltyTypeSelect
            :model-value="value"
            :placeholder="t('common.placeholders.selectType')"
            :empty-text="t('common.empty.noTypeFound')"
            @update:model-value="handleChange"
            @selected-option="selectedPenaltyTypeName = $event?.name ?? ''"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="threshold">
        <FormItem>
          <FormLabel>{{ t('common.labels.threshold') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="number" min="1" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ value, handleChange }" name="mode">
        <FormItem>
          <FormLabel>{{ t('modals.rule.triggerMode') }}</FormLabel>
          <FormControl>
            <FilterIdNameSelect
              :model-value="value"
              :options="modeOptions"
              :placeholder="t('modals.rule.triggerMode')"
              :search-placeholder="t('modals.rule.triggerMode')"
              :empty-text="t('common.empty.noTypeFound')"
              @update:model-value="handleChange"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <FormField v-slot="{ value, handleChange }" name="resulting_punishment_type_id">
      <FormItem>
        <FormLabel>{{ t('modals.rule.punishmentType') }}</FormLabel>
        <FormControl>
          <PunishmentTypeSelect
            :model-value="value"
            :placeholder="t('common.placeholders.selectType')"
            :empty-text="t('common.empty.noTypeFound')"
            @update:model-value="handleChange"
            @selected-option="selectedPunishmentTypeName = $event?.name ?? ''"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <FormField v-slot="{ value, handleChange }" name="due_at_mode">
        <FormItem>
          <FormLabel>{{ t('modals.rule.dueAtMode') }}</FormLabel>
          <FormControl>
            <FilterIdNameSelect
              :model-value="value"
              :options="dueAtModeOptions"
              :placeholder="t('modals.rule.dueAtMode')"
              :search-placeholder="t('modals.rule.dueAtMode')"
              :empty-text="t('common.empty.noTypeFound')"
              @update:model-value="handleChange"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField
        v-if="values.due_at_mode === 'days'"
        v-slot="{ componentField }"
        name="due_at_after_days"
      >
        <FormItem>
          <FormLabel>{{ t('modals.rule.dueAtAfterDays') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="number" min="0" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-else v-slot="{ componentField }" name="due_at_after_lessons">
        <FormItem>
          <FormLabel>{{ t('modals.rule.dueAtAfterLessons') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="number" min="1" max="5" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
  </BaseModal>
</template>
