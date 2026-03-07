<script setup lang="ts">
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { Bonus } from '~/types/api'
import { buildDelta } from '~/lib/delta'
import { parseApiDateTime, toApiDateTimeString } from '~/lib/date-time'

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  bonus: Bonus | null
}>()

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const bonusService = useBonusService()

function toDateValue(dateTime: string | null | undefined): DateValue | undefined {
  const parsed = parseApiDateTime(dateTime)
  if (!parsed) return undefined

  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const d = String(parsed.getDate()).padStart(2, '0')
  return parseDate(`${y}-${m}-${d}`)
}

function toTimeValue(dateTime: string | null | undefined): string {
  const parsed = parseApiDateTime(dateTime)
  if (!parsed) return '08:00'

  const hours = String(parsed.getHours()).padStart(2, '0')
  const minutes = String(parsed.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function getInitialOccurredAt(): string | null {
  return props.bonus?.occurred_at ?? props.bonus?.created_at ?? null
}

const schema = toTypedSchema(
  zod.object({
    points: zod.number().gt(0, t('apiErrors.details.validation_min_length', { value: 0 })),
    occurred_at: zod.any().optional(),
    occurred_at_time: zod.string().optional(),
    evaluation_label: zod.string().optional(),
  }),
)

const { handleSubmit, isSubmitting, resetForm, setFieldError, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    points: props.bonus?.points ?? 1,
    occurred_at: toDateValue(getInitialOccurredAt()),
    occurred_at_time: toTimeValue(getInitialOccurredAt()),
    evaluation_label: props.bonus?.evaluation_label ?? '',
  },
})

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()

    const initialOccurredAt = getInitialOccurredAt()

    resetForm({
      values: {
        points: props.bonus?.points ?? 1,
        occurred_at: toDateValue(initialOccurredAt),
        occurred_at_time: toTimeValue(initialOccurredAt),
        evaluation_label: props.bonus?.evaluation_label ?? '',
      },
    })
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  if (!props.bonus?.id) return

  clearErrors()
  try {
    let occurredAt: string | undefined

    if (formValues.occurred_at) {
      const date = (formValues.occurred_at as DateValue).toDate(getLocalTimeZone())
      const [h = '08', m = '00'] = (formValues.occurred_at_time || '08:00').split(':')
      date.setHours(Number(h), Number(m), 0, 0)
      occurredAt = toApiDateTimeString(date) ?? undefined
    }

    const initialPayload = {
      points: props.bonus.points,
      occurred_at: toApiDateTimeString(getInitialOccurredAt()) ?? undefined,
      evaluation_label: props.bonus.evaluation_label ?? '',
    }

    const currentPayload = {
      points: formValues.points,
      occurred_at: occurredAt,
      evaluation_label: formValues.evaluation_label ?? '',
    }

    const deltaPayload = buildDelta(initialPayload, currentPayload)

    if (Object.keys(deltaPayload).length > 0) {
      await bonusService.updateBonus(props.bonus.id, deltaPayload)
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
    :title="t('modals.bonus.editTitle')"
    :global-error="globalError"
    :submitting="isSubmitting"
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

    <FormField v-slot="{ value: dateValue, handleChange: handleChangeDate }" name="occurred_at">
      <FormField
        v-slot="{ value: timeValue, handleChange: handleChangeTime }"
        name="occurred_at_time"
      >
        <FormItem>
          <FormLabel>{{ t('common.labels.occurredAt') }}</FormLabel>
          <FormControl>
            <DatePicker
              :model-value="dateValue"
              :time="timeValue"
              :placeholder="t('common.placeholders.selectOccurredDate')"
              show-time
              @update:model-value="handleChangeDate"
              @update:time="handleChangeTime"
            />
          </FormControl>
          <FormMessage name="occurred_at" />
        </FormItem>
      </FormField>
    </FormField>

    <FormField v-slot="{ componentField }" name="evaluation_label">
      <FormItem>
        <FormLabel>{{ t('common.labels.evaluationLabel') }}</FormLabel>
        <FormControl>
          <Input
            v-bind="componentField"
            type="text"
            :placeholder="t('common.placeholders.evaluationLabel')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
