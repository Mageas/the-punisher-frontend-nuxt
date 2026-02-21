<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { RuleMode } from '~/types/api'
import { useRulesStore } from '~/stores/rules.store'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const { penaltyTypes, fetchPenaltyTypes } = useAllPenaltyTypes()
const { punishmentTypes, fetchPunishmentTypes } = useAllPunishmentTypes()
const store = useRulesStore()

const schema = toTypedSchema(
  zod.object({
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

const { handleSubmit, isSubmitting, resetForm, setFieldError, values, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    penalty_type_id: '',
    resulting_punishment_type_id: '',
    threshold: 3,
    mode: 'at' as RuleMode,
    due_at_after_days: 7,
  },
})

const selectedPenaltyTypeName = computed(
  () => penaltyTypes.value.find((type) => type.id === values.penalty_type_id)?.name ?? '',
)

const selectedPunishmentTypeName = computed(
  () =>
    punishmentTypes.value.find((type) => type.id === values.resulting_punishment_type_id)?.name ??
    '',
)

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
    await Promise.all([fetchPenaltyTypes(), fetchPunishmentTypes()])
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  try {
    await store.createOne({
      ...formValues,
      name: generatedRuleName.value.substring(0, 120), // Max 120 per DTO
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
    @submit="onSubmit"
  >
    <FormField v-slot="{ value, handleChange }" name="penalty_type_id">
      <FormItem>
        <FormLabel>{{ t('modals.rule.penaltyType') }}</FormLabel>
        <FormControl>
          <PenaltyTypeSelect
            :model-value="value"
            :penalty-types="penaltyTypes"
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
            :punishment-types="punishmentTypes"
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
