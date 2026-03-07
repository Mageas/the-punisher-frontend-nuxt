<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { Bonus } from '~/types/api'
import { buildDelta } from '~/lib/delta'
import { toApiDateTimeString } from '~/lib/date-time'

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  bonus: Bonus | null
}>()

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const { isPending: submitLoading, withPending: withSubmitLoading } = useApiActionState()
const bonusService = useBonusService()
const { notifyUpdateSuccess } = useActionToast()

function getInitialOccurredAt(): string | null {
  return props.bonus?.occurred_at ?? props.bonus?.created_at ?? null
}

const {
  getInitialOccurredAtFieldValues,
  resetOccurredAtTouched,
  handleOccurredAtDateChange,
  handleOccurredAtTimeChange,
  serializeOccurredAt,
} = useEditableOccurredAt({
  getInitialOccurredAt,
})

const schema = toTypedSchema(
  zod.object({
    points: zod.number().gt(0, t('apiErrors.details.validation_min_length', { value: 0 })),
    occurred_at: zod.any().optional(),
    occurred_at_time: zod.string().optional(),
    evaluation_label: zod.string().optional(),
  }),
)

function getInitialValues() {
  return {
    points: props.bonus?.points ?? 1,
    ...getInitialOccurredAtFieldValues(),
    evaluation_label: props.bonus?.evaluation_label ?? '',
  }
}

const { handleSubmit, resetForm, setFieldError, setFieldValue, values, meta } = useForm({
  validationSchema: schema,
  initialValues: getInitialValues(),
})

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetOccurredAtTouched()
    resetForm({ values: getInitialValues() })
  }
})

function onOccurredAtTimeChange(value: string) {
  handleOccurredAtTimeChange(value, (nextValue) => {
    setFieldValue('occurred_at_time', nextValue, false)
  })
}

const onSubmit = handleSubmit(async (formValues) => {
  const bonus = props.bonus
  if (!bonus?.id) return

  clearErrors()
  try {
    const occurredAt = serializeOccurredAt({
      dateValue: formValues.occurred_at as DateValue | undefined,
      timeValue: formValues.occurred_at_time,
    })

    const initialPayload = {
      points: bonus.points,
      occurred_at: toApiDateTimeString(getInitialOccurredAt()) ?? undefined,
      evaluation_label: bonus.evaluation_label ?? '',
    }

    const currentPayload = {
      points: formValues.points,
      occurred_at: occurredAt,
      evaluation_label: formValues.evaluation_label ?? '',
    }

    const deltaPayload = buildDelta(initialPayload, currentPayload)

    if (Object.keys(deltaPayload).length > 0) {
      await withSubmitLoading(async () => {
        await bonusService.updateBonus(bonus.id, deltaPayload)
        notifyUpdateSuccess()
        emit('updated')
      })
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
    :title="t('modals.bonus.editTitle')"
    :global-error="globalError"
    :submitting="submitLoading"
    :can-submit="meta.valid"
    :submit-text="t('common.actions.save')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <FormField v-slot="{ componentField }" name="points">
      <FormItem>
        <FormLabel>{{ t('common.labels.points') }}</FormLabel>
        <FormControl>
          <Input
            v-bind="componentField"
            type="number"
            step="0.01"
            min="0.01"
            :placeholder="t('common.placeholders.points')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <EventMetadataFormFields
      :occurred-at-time="values.occurred_at_time"
      :on-occurred-at-date-change="handleOccurredAtDateChange"
      :on-occurred-at-time-change="onOccurredAtTimeChange"
    />
  </BaseModal>
</template>
