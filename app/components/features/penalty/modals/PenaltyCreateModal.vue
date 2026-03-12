<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { DateValue } from '@internationalized/date'
import { getUserTimeZone, serializeDateValueWithTime } from '~/lib/date-time'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })
const props = withDefaults(
  defineProps<{
    preselectedStudentId?: string | null
    preselectedClassroomId?: string | null
  }>(),
  {
    preselectedStudentId: null,
    preselectedClassroomId: null,
  },
)

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const { isPending: submitLoading, withPending: withSubmitLoading } = useApiActionState()
const penaltyService = usePenaltyService()
const { notifyCreateSuccess } = useActionToast()

const schema = toTypedSchema(
  zod
    .object({
      student_lookup_classroom_id: zod.string().optional(),
      classroom_id: zod.string().optional(),
      student_id: zod
        .string()
        .min(1, t('apiErrors.details.validation_field_required'))
        .uuid(
          t('apiErrors.details.validation_malformed_parameter', {
            value: 'UUID',
          }),
        ),
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
    })
    .superRefine((_, ctx) => {
      if (requiresStudentClassroomSelection.value && !selectedStudentClassroomId.value) {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          path: ['classroom_id'],
          message: t('apiErrors.details.punishment_classroom_not_resolved'),
        })
      }
    }),
)

function getInitialValues() {
  const preselectedLookupClassroomId = props.preselectedStudentId
    ? ''
    : (props.preselectedClassroomId ?? '')

  return {
    student_lookup_classroom_id: preselectedLookupClassroomId,
    classroom_id: props.preselectedStudentId ? '' : preselectedLookupClassroomId,
    student_id: props.preselectedStudentId ?? '',
    penalty_type_id: '',
    occurred_at: undefined as DateValue | undefined,
    occurred_at_time: '08:00',
    evaluation_label: '',
  }
}

const { handleSubmit, resetForm, setFieldError, values, setFieldValue, meta } = useForm({
  validationSchema: schema,
  initialValues: getInitialValues(),
})

const {
  hasPreselectedStudent,
  hasPreselectedClassroom,
  loadingSelectedStudentClassrooms,
  selectedStudentClassroomId,
  studentClassroomOptions,
  requiresStudentClassroomSelection,
  shouldShowStudentClassroomSelect,
  isStudentClassroomMissing,
  isStudentClassroomDrawerOpen,
  selectStudentClassroom,
  initializeResolvedStudentClassroomSelection,
  cleanupResolvedStudentClassroomSelection,
} = useResolvedStudentClassroomSelection({
  open,
  values,
  setFieldValue,
  setFieldError,
  preselectedStudentId: () => props.preselectedStudentId,
  preselectedClassroomId: () => props.preselectedClassroomId,
})

const canSubmit = computed(
  () =>
    meta.value.valid && !loadingSelectedStudentClassrooms.value && !isStudentClassroomMissing.value,
)

// Load data when modal opens
watch(open, async (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetForm({ values: getInitialValues() })
    await initializeResolvedStudentClassroomSelection()
    return
  }

  cleanupResolvedStudentClassroomSelection()
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  try {
    const occurredAt = serializeDateValueWithTime({
      dateValue: formValues.occurred_at,
      timeValue: formValues.occurred_at_time,
      timeZone: getUserTimeZone(),
    })

    const evaluationLabel = formValues.evaluation_label?.trim()

    await withSubmitLoading(async () => {
      await penaltyService.createPenalty({
        student_id: formValues.student_id,
        penalty_type_id: formValues.penalty_type_id,
        ...(selectedStudentClassroomId.value
          ? { classroom_id: selectedStudentClassroomId.value }
          : {}),
        ...(occurredAt ? { occurred_at: occurredAt } : {}),
        ...(evaluationLabel ? { evaluation_label: evaluationLabel } : {}),
      })
      notifyCreateSuccess()
      open.value = false
      emit('created')
    })
  } catch (err) {
    setFormErrors(setFieldError, err)
  }
})
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="t('modals.penalty.title')"
    :global-error="globalError"
    :submitting="submitLoading"
    :can-submit="canSubmit"
    :submit-text="t('common.actions.submit')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <template v-if="!hasPreselectedStudent">
      <StudentLookupFields
        :show-classroom-lookup="!hasPreselectedClassroom"
        :lookup-classroom-id="values.student_lookup_classroom_id || ''"
        @update:student-lookup-classroom-id="
          setFieldValue('student_lookup_classroom_id', $event, false)
        "
      />
    </template>

    <ResolvedStudentClassroomField
      v-model:open="isStudentClassroomDrawerOpen"
      :show="shouldShowStudentClassroomSelect"
      :classrooms="studentClassroomOptions"
      :selected-classroom-id="selectedStudentClassroomId"
      :loading="loadingSelectedStudentClassrooms"
      :hint="t('modals.penalty.studentClassroomPickHint')"
      @select="selectStudentClassroom"
    />

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
