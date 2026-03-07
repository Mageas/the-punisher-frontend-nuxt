<script setup lang="ts">
import { parseDate, getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { Punishment } from '~/types/api'
import { buildDelta } from '~/lib/delta'
import {
  parseApiDateTime,
  serializeEditableDateTime,
  toApiDateTimeString,
  toTimeInputValue,
} from '~/lib/date-time'

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  punishment: Punishment | null
}>()

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const { isPending: submitLoading, withPending: withSubmitLoading } = useApiActionState()
const punishmentService = usePunishmentService()
const { notifyUpdateSuccess } = useActionToast()
const occurredAtTouched = ref(false)

function toDateValue(dateTime: string | null | undefined): DateValue | undefined {
  const parsed = parseApiDateTime(dateTime)
  if (!parsed) return undefined

  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const d = String(parsed.getDate()).padStart(2, '0')
  return parseDate(`${y}-${m}-${d}`)
}

function getInitialOccurredAt(): string | null {
  return props.punishment?.occurred_at ?? props.punishment?.created_at ?? null
}

const schema = toTypedSchema(
  zod.object({
    occurred_at: zod.any().optional(),
    occurred_at_time: zod.string().optional(),
    evaluation_label: zod.string().optional(),
  }),
)

const { handleSubmit, resetForm, setFieldError, setFieldValue, values, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    occurred_at: toDateValue(getInitialOccurredAt()),
    occurred_at_time: toTimeInputValue(getInitialOccurredAt()),
    evaluation_label: props.punishment?.evaluation_label ?? '',
  },
})

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    occurredAtTouched.value = false

    const initialOccurredAt = getInitialOccurredAt()

    resetForm({
      values: {
        occurred_at: toDateValue(initialOccurredAt),
        occurred_at_time: toTimeInputValue(initialOccurredAt),
        evaluation_label: props.punishment?.evaluation_label ?? '',
      },
    })
  }
})

function handleOccurredAtDateChange(
  value: DateValue | undefined,
  handleChangeDate: (value: DateValue | undefined) => void,
) {
  occurredAtTouched.value = true
  handleChangeDate(value)
}

function handleOccurredAtTimeChange(value: string) {
  occurredAtTouched.value = true
  setFieldValue('occurred_at_time', value, false)
}

const onSubmit = handleSubmit(async (formValues) => {
  const punishment = props.punishment
  if (!punishment?.id) return

  clearErrors()
  try {
    const initialOccurredAt = getInitialOccurredAt()
    const occurredAt = serializeEditableDateTime({
      dateValue: formValues.occurred_at as DateValue | undefined,
      timeValue: formValues.occurred_at_time,
      timeZone: getLocalTimeZone(),
      touched: occurredAtTouched.value,
      initialApiValue: initialOccurredAt,
    })

    const initialPayload = {
      occurred_at: toApiDateTimeString(initialOccurredAt) ?? undefined,
      evaluation_label: punishment.evaluation_label ?? '',
    }

    const currentPayload = {
      occurred_at: occurredAt,
      evaluation_label: formValues.evaluation_label ?? '',
    }

    const deltaPayload = buildDelta(initialPayload, currentPayload)

    if (Object.keys(deltaPayload).length > 0) {
      await withSubmitLoading(async () => {
        await punishmentService.updatePunishment(punishment.id, deltaPayload)
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
    :title="t('modals.punishment.editTitle')"
    :global-error="globalError"
    :submitting="submitLoading"
    :can-submit="meta.valid"
    :submit-text="t('common.actions.save')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <FormField v-slot="{ value: dateValue, handleChange: handleChangeDate }" name="occurred_at">
      <FormItem>
        <FormLabel>{{ t('common.labels.occurredAt') }}</FormLabel>
        <FormControl>
          <DatePicker
            :model-value="dateValue"
            :time="values.occurred_at_time"
            :placeholder="t('common.placeholders.selectOccurredDate')"
            show-time
            @update:model-value="(value) => handleOccurredAtDateChange(value, handleChangeDate)"
            @update:time="handleOccurredAtTimeChange"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
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
