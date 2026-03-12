<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { DateValue } from '@internationalized/date'
import { getUserTimeZone, serializeDateValueWithTime } from '~/lib/date-time'
import type { Student } from '~/types/api'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{
  students: Student[]
  classroomId: string
}>()

const { t } = useI18n()
const { globalError, clearErrors, handleApiError } = useApiErrors()
const penaltyService = usePenaltyService()
const { notifyCreateSuccess } = useActionToast()

const submitLoading = ref(false)

const schema = toTypedSchema(
  zod.object({
    penalty_type_id: zod
      .string()
      .min(1, t('apiErrors.details.validation_field_required'))
      .uuid(
        t('apiErrors.details.validation_malformed_parameter', {
          value: 'UUID',
        }),
      ),
    occurred_at: zod.any().optional(),
    occurred_at_time: zod.string().optional(),
    evaluation_label: zod.string().optional(),
  }),
)

function getInitialValues() {
  return {
    penalty_type_id: '',
    occurred_at: undefined as DateValue | undefined,
    occurred_at_time: '08:00',
    evaluation_label: '',
  }
}

const { handleSubmit, resetForm, setFieldValue, values, meta } = useForm({
  validationSchema: schema,
  initialValues: getInitialValues(),
})

const studentNames = computed(() =>
  props.students.map((s) => `${s.first_name} ${s.last_name}`).join(', '),
)

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetForm({ values: getInitialValues() })
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  submitLoading.value = true

  try {
    const occurredAt = serializeDateValueWithTime({
      dateValue: formValues.occurred_at,
      timeValue: formValues.occurred_at_time,
      timeZone: getUserTimeZone(),
    })

    const evaluationLabel = formValues.evaluation_label?.trim()
    await penaltyService.createBulkPenalties(props.classroomId, {
      student_ids: props.students.map((student) => student.id),
      penalty_type_id: formValues.penalty_type_id,
      ...(occurredAt ? { occurred_at: occurredAt } : {}),
      ...(evaluationLabel ? { evaluation_label: evaluationLabel } : {}),
    })

    notifyCreateSuccess()
    open.value = false
    emit('created')
  } catch (err) {
    handleApiError(err)
  } finally {
    submitLoading.value = false
  }
})
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="t('classProfile.bulkPenalty.title')"
    :global-error="globalError"
    :submitting="submitLoading"
    :can-submit="meta.valid"
    :submit-text="submitLoading ? t('common.loading') : t('common.actions.submit')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <div class="rounded-lg border border-border bg-muted/50 px-3 py-2.5">
      <p class="text-sm font-medium text-muted-foreground">
        {{ t('classProfile.bulkPenalty.selectedStudents', students.length) }}
      </p>
      <p class="mt-1 text-sm leading-relaxed line-clamp-3">
        {{ studentNames }}
      </p>
    </div>

    <FormField v-slot="{ value, handleChange }" name="penalty_type_id">
      <FormItem>
        <FormLabel>{{ t('modals.penalty.penaltyType') }}</FormLabel>
        <FormControl>
          <PenaltyTypeSelect :model-value="value" @update:model-value="handleChange" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ value: dateValue, handleChange: handleChangeDate }" name="occurred_at">
      <FormItem>
        <FormLabel>{{ t('common.labels.occurredAt') }}</FormLabel>
        <FormControl>
          <DatePicker
            :model-value="dateValue"
            :time="values.occurred_at_time"
            :placeholder="t('common.placeholders.selectOccurredDate')"
            show-time
            @update:model-value="handleChangeDate"
            @update:time="(value) => setFieldValue('occurred_at_time', value, false)"
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
