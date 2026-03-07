<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone } from '@internationalized/date'
import { toApiDateTimeString } from '~/lib/date-time'

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
const bonusService = useBonusService()

const hasPreselectedStudent = computed(() => !!props.preselectedStudentId)
const hasPreselectedClassroom = computed(() => !!props.preselectedClassroomId)

const schema = toTypedSchema(
  zod.object({
    classroom_id: zod.string().optional(),
    student_id: zod
      .string()
      .min(1, t('apiErrors.details.validation_field_required'))
      .uuid(
        t('apiErrors.details.validation_malformed_parameter', {
          value: 'UUID',
        }),
      ),
    bonus_type_id: zod
      .string()
      .min(1, t('apiErrors.details.validation_field_required'))
      .uuid(
        t('apiErrors.details.validation_malformed_parameter', {
          value: 'UUID',
        }),
      ),
    points: zod.number().gt(0, t('apiErrors.details.validation_min_length', { value: 0 })),
    occurred_at: zod.any().optional(),
    occurred_at_time: zod.string().optional(),
    evaluation_label: zod.string().optional(),
  }),
)

const { handleSubmit, resetForm, setFieldError, values, setFieldValue, meta } = useForm({
  validationSchema: schema,
  initialValues: {
    classroom_id: props.preselectedClassroomId ?? '',
    student_id: props.preselectedStudentId ?? '',
    bonus_type_id: '',
    points: 1,
    occurred_at: undefined as DateValue | undefined,
    occurred_at_time: '08:00',
    evaluation_label: '',
  },
})

// When classroom changes, reset student selection
watch(
  () => values.classroom_id,
  () => {
    if (!open.value) return
    if (hasPreselectedStudent.value) return
    setFieldValue('student_id', '', false)
  },
)

// Load data when modal opens
watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetForm({
      values: {
        classroom_id: props.preselectedClassroomId ?? '',
        student_id: props.preselectedStudentId ?? '',
        bonus_type_id: '',
        points: 1,
        occurred_at: undefined,
        occurred_at_time: '08:00',
        evaluation_label: '',
      },
    })
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  try {
    let occurredAt: string | undefined
    if (formValues.occurred_at) {
      const date = (formValues.occurred_at as DateValue).toDate(getLocalTimeZone())
      const [h = '08', m = '00'] = (formValues.occurred_at_time || '08:00').split(':')
      date.setHours(Number(h), Number(m), 0, 0)
      occurredAt = toApiDateTimeString(date) ?? undefined
    }

    const evaluationLabel = formValues.evaluation_label?.trim()

    await withSubmitLoading(async () => {
      await bonusService.createBonus({
        student_id: formValues.student_id,
        bonus_type_id: formValues.bonus_type_id,
        points: formValues.points,
        ...(occurredAt ? { occurred_at: occurredAt } : {}),
        ...(evaluationLabel ? { evaluation_label: evaluationLabel } : {}),
      })
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
    :title="t('modals.bonus.title')"
    :global-error="globalError"
    :submitting="submitLoading"
    :can-submit="meta.valid"
    :submit-text="t('common.actions.submit')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <template v-if="!hasPreselectedStudent">
      <FormField v-if="!hasPreselectedClassroom" v-slot="{ value }" name="classroom_id">
        <FormItem>
          <FormLabel>{{ t('common.labels.classroom') }}</FormLabel>
          <FormControl>
            <ClassroomSelect
              :model-value="value"
              full-width
              @update:model-value="setFieldValue('classroom_id', $event, false)"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ value, handleChange }" name="student_id">
        <FormItem>
          <FormLabel>{{ t('common.labels.student') }}</FormLabel>
          <FormControl>
            <StudentSelect
              :key="values.classroom_id || '__all_students__'"
              :model-value="value"
              :classroom-id="values.classroom_id || null"
              :options-scope-key="values.classroom_id || '__all_students__'"
              :placeholder="t('common.placeholders.selectStudent')"
              :empty-text="t('common.empty.noStudents')"
              @update:model-value="handleChange"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </template>

    <FormField v-slot="{ value, handleChange }" name="bonus_type_id">
      <FormItem>
        <FormLabel>{{ t('modals.bonus.bonusType') }}</FormLabel>
        <FormControl>
          <BonusTypeSelect :model-value="value" @update:model-value="handleChange" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

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
