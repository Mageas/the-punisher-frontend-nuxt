<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { Punishment } from '~/types/api'
import { buildDelta } from '~/lib/delta'
import { toApiDateTimeString } from '~/lib/date-time'

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

function getInitialOccurredAt(): string | null {
  return props.punishment?.occurred_at ?? props.punishment?.created_at ?? null
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
    occurred_at: zod.any().optional(),
    occurred_at_time: zod.string().optional(),
    evaluation_label: zod.string().optional(),
  }),
)

function getInitialValues() {
  return {
    ...getInitialOccurredAtFieldValues(),
    evaluation_label: props.punishment?.evaluation_label ?? '',
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
  const punishment = props.punishment
  if (!punishment?.id) return

  clearErrors()
  try {
    const occurredAt = serializeOccurredAt({
      dateValue: formValues.occurred_at as DateValue | undefined,
      timeValue: formValues.occurred_at_time,
    })

    const initialPayload = {
      occurred_at: toApiDateTimeString(getInitialOccurredAt()) ?? undefined,
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
    <EventMetadataFormFields
      :occurred-at-time="values.occurred_at_time"
      :on-occurred-at-date-change="handleOccurredAtDateChange"
      :on-occurred-at-time-change="onOccurredAtTimeChange"
    />
  </BaseModal>
</template>
