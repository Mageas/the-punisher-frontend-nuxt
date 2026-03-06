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
const punishmentService = usePunishmentService()

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
    punishment_type_id: zod
      .string()
      .min(1, t('apiErrors.details.validation_field_required'))
      .uuid(
        t('apiErrors.details.validation_malformed_parameter', {
          value: 'UUID',
        }),
      ),
    due_at: zod.any().refine((val) => !!val, t('apiErrors.details.validation_field_required')),
    due_at_time: zod.string().min(1, t('apiErrors.details.validation_field_required')),
    occurred_at: zod.any().optional(),
    occurred_at_time: zod.string().optional(),
    evaluation_label: zod.string().optional(),
  }),
)

const { handleSubmit, isSubmitting, resetForm, setFieldError, values, setFieldValue, meta } =
  useForm({
    validationSchema: schema,
    initialValues: {
      classroom_id: props.preselectedClassroomId ?? '',
      student_id: props.preselectedStudentId ?? '',
      punishment_type_id: '',
      due_at: undefined as DateValue | undefined,
      due_at_time: '08:00',
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
        punishment_type_id: '',
        due_at: undefined,
        due_at_time: '08:00',
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
    const date = (formValues.due_at as DateValue).toDate(getLocalTimeZone())
    const [h, m] = formValues.due_at_time.split(':')
    date.setHours(Number(h), Number(m), 0, 0)
    const dueAt = toApiDateTimeString(date) ?? undefined

    let occurredAt: string | undefined
    if (formValues.occurred_at) {
      const occurredDate = (formValues.occurred_at as DateValue).toDate(getLocalTimeZone())
      const [occurredH = '08', occurredM = '00'] = (formValues.occurred_at_time || '08:00').split(
        ':',
      )
      occurredDate.setHours(Number(occurredH), Number(occurredM), 0, 0)
      occurredAt = toApiDateTimeString(occurredDate) ?? undefined
    }

    const evaluationLabel = formValues.evaluation_label?.trim()

    await punishmentService.createPunishment({
      student_id: formValues.student_id,
      punishment_type_id: formValues.punishment_type_id,
      due_at: dueAt,
      ...(occurredAt ? { occurred_at: occurredAt } : {}),
      ...(evaluationLabel ? { evaluation_label: evaluationLabel } : {}),
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
    :title="t('modals.punishment.title')"
    :global-error="globalError"
    :submitting="isSubmitting"
    :can-submit="meta.valid"
    :submit-text="t('modals.punishment.submit')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <template v-if="!hasPreselectedStudent">
      <FormField v-if="!hasPreselectedClassroom" v-slot="{ value }" name="classroom_id">
        <FormItem>
          <FormLabel>{{ t('modals.punishment.class') }}</FormLabel>
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
          <FormLabel>{{ t('modals.punishment.student') }}</FormLabel>
          <FormControl>
            <StudentSelect
              :key="values.classroom_id || '__all_students__'"
              :model-value="value"
              :classroom-id="values.classroom_id || null"
              :options-scope-key="values.classroom_id || '__all_students__'"
              :placeholder="t('modals.punishment.selectStudent')"
              :empty-text="t('modals.punishment.noStudentFound')"
              @update:model-value="handleChange"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </template>

    <FormField v-slot="{ value, handleChange }" name="punishment_type_id">
      <FormItem>
        <FormLabel>{{ t('modals.punishment.punishmentType') }}</FormLabel>
        <FormControl>
          <PunishmentTypeSelect :model-value="value" @update:model-value="handleChange" />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ value: dateValue, handleChange: handleChangeDate }" name="due_at">
      <FormField v-slot="{ value: timeValue, handleChange: handleChangeTime }" name="due_at_time">
        <FormItem>
          <FormLabel>{{ t('modals.punishment.dueAt') }}</FormLabel>
          <FormControl>
            <DatePicker
              :model-value="dateValue"
              :time="timeValue"
              :placeholder="t('modals.punishment.selectDate')"
              show-time
              @update:model-value="handleChangeDate"
              @update:time="handleChangeTime"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </FormField>

    <FormField v-slot="{ value: dateValue, handleChange: handleChangeDate }" name="occurred_at">
      <FormField
        v-slot="{ value: timeValue, handleChange: handleChangeTime }"
        name="occurred_at_time"
      >
        <FormItem>
          <FormLabel>{{ t('modals.punishment.occurredAt') }}</FormLabel>
          <FormControl>
            <DatePicker
              :model-value="dateValue"
              :time="timeValue"
              :placeholder="t('modals.punishment.selectOccurredDate')"
              show-time
              @update:model-value="handleChangeDate"
              @update:time="handleChangeTime"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </FormField>

    <FormField v-slot="{ componentField }" name="evaluation_label">
      <FormItem>
        <FormLabel>{{ t('modals.punishment.evaluationLabel') }}</FormLabel>
        <FormControl>
          <Input
            v-bind="componentField"
            type="text"
            :placeholder="t('modals.punishment.evaluationLabelPlaceholder')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
