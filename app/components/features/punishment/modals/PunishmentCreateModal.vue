<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone } from '@internationalized/date'

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
const { classrooms, fetchClassrooms } = useAllClassrooms()
const { students, fetchStudents } = useAllStudents()
const { punishmentTypes, fetchPunishmentTypes } = useAllPunishmentTypes()
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
    },
  })

// When classroom changes, re-fetch students and reset student selection
watch(
  () => values.classroom_id,
  (newClassroomId) => {
    if (!open.value) return
    if (hasPreselectedStudent.value) return
    setFieldValue('student_id', '', false)
    fetchStudents(newClassroomId || undefined)
  },
)

// Load data when modal opens
watch(open, async (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetForm({
      values: {
        classroom_id: props.preselectedClassroomId ?? '',
        student_id: props.preselectedStudentId ?? '',
        punishment_type_id: '',
        due_at: undefined,
        due_at_time: '08:00',
      },
    })
    await Promise.all([
      hasPreselectedStudent.value || hasPreselectedClassroom.value
        ? Promise.resolve()
        : fetchClassrooms(),
      fetchStudents(values.classroom_id || undefined),
      fetchPunishmentTypes(),
    ])
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  try {
    const date = (formValues.due_at as DateValue).toDate(getLocalTimeZone())
    const [h, m] = formValues.due_at_time.split(':')
    date.setHours(Number(h), Number(m), 0, 0)

    await punishmentService.createPunishment({
      student_id: formValues.student_id,
      punishment_type_id: formValues.punishment_type_id,
      due_at: date.toISOString(),
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
      <FormField
        v-if="!hasPreselectedClassroom"
        v-slot="{ value, handleChange }"
        name="classroom_id"
      >
        <FormItem>
          <FormLabel>{{ t('modals.punishment.class') }}</FormLabel>
          <FormControl>
            <ClassroomSelect
              :model-value="value"
              :classrooms="classrooms"
              full-width
              @update:model-value="handleChange"
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
              :model-value="value"
              :students="students"
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
          <PunishmentTypeSelect
            :model-value="value"
            :punishment-types="punishmentTypes"
            @update:model-value="handleChange"
          />
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
  </BaseModal>
</template>
