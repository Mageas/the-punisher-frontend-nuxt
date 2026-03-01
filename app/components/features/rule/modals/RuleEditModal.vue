<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { Rule, RuleMode } from '~/types/api'
import { buildDelta } from '~/lib/delta'

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  rule: Rule | null
}>()

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const ruleService = useRuleService()

const schema = toTypedSchema(
  zod.object({
    name: zod
      .string()
      .min(2, t('apiErrors.details.validation_min_length', { value: 2 }))
      .max(120, t('apiErrors.details.validation_max_length', { value: 120 })),
    penalty_type_id: zod.string().min(1, t('apiErrors.details.validation_field_required')),
    resulting_punishment_type_id: zod
      .string()
      .min(1, t('apiErrors.details.validation_field_required')),
    threshold: zod.number().min(1, t('apiErrors.details.validation_min_length', { value: 1 })),
    mode: zod.enum(['at', 'every', 'after'] as const),
    due_at_after_days: zod
      .number()
      .min(0, t('apiErrors.details.validation_min_length', { value: 0 })),
  }),
)

const { handleSubmit, isSubmitting, resetForm, setFieldError, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    name: props.rule?.name ?? '',
    penalty_type_id: props.rule?.penalty_type_id ?? '',
    resulting_punishment_type_id: props.rule?.resulting_punishment_type_id ?? '',
    threshold: props.rule?.threshold ?? 3,
    mode: (props.rule?.mode ?? 'at') as RuleMode,
    due_at_after_days: props.rule?.due_at_after_days ?? 7,
  },
})

watch(open, (isOpen) => {
  if (isOpen && props.rule) {
    clearErrors()
    resetForm({
      values: {
        name: props.rule.name,
        penalty_type_id: props.rule.penalty_type_id,
        resulting_punishment_type_id: props.rule.resulting_punishment_type_id,
        threshold: props.rule.threshold,
        mode: props.rule.mode,
        due_at_after_days: props.rule.due_at_after_days,
      },
    })
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  if (!props.rule?.id) return
  clearErrors()
  try {
    const initialPayload = {
      name: props.rule.name,
      penalty_type_id: props.rule.penalty_type_id,
      resulting_punishment_type_id: props.rule.resulting_punishment_type_id,
      threshold: props.rule.threshold,
      mode: props.rule.mode,
      due_at_after_days: props.rule.due_at_after_days,
      is_active: props.rule.is_active,
    }
    const currentPayload = {
      ...formValues,
      is_active: props.rule.is_active,
    }
    const deltaPayload = buildDelta(initialPayload, currentPayload)

    if (Object.keys(deltaPayload).length > 0) {
      await ruleService.updateRule(props.rule.id, deltaPayload)
      emit('updated')
    }

    open.value = false
  } catch (err) {
    setFormErrors(setFieldError, err)
  }
})
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="t('modals.rule.editTitle')"
    :global-error="globalError"
    :submitting="isSubmitting"
    :can-submit="meta.valid"
    :submit-text="t('modals.rule.save')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <FormField v-slot="{ componentField }" name="name">
      <FormItem>
        <FormLabel>{{ t('typeManagement.name') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" type="text" />
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
            :selected-name="props.rule?.penalty_type_name"
            :placeholder="t('modals.rule.selectPenaltyType')"
            :empty-text="t('modals.rule.noPenaltyTypeFound')"
            @update:model-value="handleChange"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <FormField v-slot="{ componentField }" name="threshold">
        <FormItem>
          <FormLabel>{{ t('modals.rule.threshold') }}</FormLabel>
          <FormControl>
            <Input v-bind="componentField" type="number" min="1" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ value, handleChange }" name="mode">
        <FormItem>
          <FormLabel>{{ t('modals.rule.mode') }}</FormLabel>
          <FormControl>
            <NativeSelect :model-value="value" @update:model-value="handleChange as any">
              <option value="at">
                {{ t('rules.modes.at') }}
              </option>
              <option value="every">
                {{ t('rules.modes.every') }}
              </option>
              <option value="after">
                {{ t('rules.modes.after') }}
              </option>
            </NativeSelect>
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
            :selected-name="props.rule?.resulting_punishment_type_name"
            :placeholder="t('modals.rule.selectPunishmentType')"
            :empty-text="t('modals.rule.noPunishmentTypeFound')"
            @update:model-value="handleChange"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="due_at_after_days">
      <FormItem>
        <FormLabel>{{ t('modals.rule.dueAtAfterDays') }}</FormLabel>
        <FormControl>
          <Input v-bind="componentField" type="number" min="0" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
