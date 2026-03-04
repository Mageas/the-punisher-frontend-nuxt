<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { RuleMode } from '~/types/api'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const ruleService = useRuleService()

const schema = toTypedSchema(
  zod.object({
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
    name: '',
    penalty_type_id: '',
    resulting_punishment_type_id: '',
    threshold: 3,
    mode: 'at' as RuleMode,
    due_at_after_days: 7,
  },
})

const selectedPenaltyTypeName = ref('')
const selectedPunishmentTypeName = ref('')
const modeOptions = computed(() => [
  { id: 'at', name: t('rules.modes.at') },
  { id: 'every', name: t('rules.modes.every') },
  { id: 'after', name: t('rules.modes.after') },
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
    resetForm()
    selectedPenaltyTypeName.value = ''
    selectedPunishmentTypeName.value = ''
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  try {
    const customName = formValues.name?.trim() ?? ''
    const resolvedName = (customName || generatedRuleName.value).substring(0, 120)
    const { name: _unusedName, ...rest } = formValues

    await ruleService.createRule({
      ...rest,
      name: resolvedName,
      is_active: true,
    })
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
    :submit-text="t('modals.rule.create')"
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
            :placeholder="t('modals.rule.selectPenaltyType')"
            :empty-text="t('modals.rule.noPenaltyTypeFound')"
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
            <FilterIdNameSelect
              :model-value="value"
              :options="modeOptions"
              :placeholder="t('modals.rule.mode')"
              :search-placeholder="t('modals.rule.mode')"
              :empty-text="t('filters.noTypeFound')"
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
            :placeholder="t('modals.rule.selectPunishmentType')"
            :empty-text="t('modals.rule.noPunishmentTypeFound')"
            @update:model-value="handleChange"
            @selected-option="selectedPunishmentTypeName = $event?.name ?? ''"
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
