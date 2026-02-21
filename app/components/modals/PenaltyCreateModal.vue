<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { usePenaltiesStore } from '~/stores/penalties.store'

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
const { penaltyTypes, fetchPenaltyTypes } = useAllPenaltyTypes()
const store = usePenaltiesStore()

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
    penalty_type_id: zod
      .string()
      .min(1, t('apiErrors.details.validation_field_required'))
      .uuid(
        t('apiErrors.details.validation_malformed_parameter', {
          value: 'UUID',
        }),
      ),
  }),
)

const { handleSubmit, isSubmitting, resetForm, setFieldError, values, setFieldValue, meta } =
  useForm({
    validationSchema: schema,
    initialValues: {
      classroom_id: props.preselectedClassroomId ?? '',
      student_id: props.preselectedStudentId ?? '',
      penalty_type_id: '',
    },
  })

// When classroom changes, re-fetch students and reset student selection
watch(
  () => values.classroom_id,
  (newClassroomId) => {
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
        penalty_type_id: '',
      },
    })
    await Promise.all([
      hasPreselectedStudent.value || hasPreselectedClassroom.value
        ? Promise.resolve()
        : fetchClassrooms(),
      fetchStudents(values.classroom_id || undefined),
      fetchPenaltyTypes(),
    ])
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  try {
    await store.createOne({
      student_id: formValues.student_id,
      penalty_type_id: formValues.penalty_type_id,
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
    :title="t('modals.penalty.title')"
    :global-error="globalError"
    :submitting="isSubmitting"
    :can-submit="meta.valid"
    :submit-text="t('modals.penalty.submit')"
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
          <FormLabel>{{ t('modals.penalty.class') }}</FormLabel>
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
          <FormLabel>{{ t('modals.penalty.student') }}</FormLabel>
          <FormControl>
            <StudentSelect
              :model-value="value"
              :students="students"
              :placeholder="t('modals.penalty.selectStudent')"
              :empty-text="t('modals.penalty.noStudentFound')"
              @update:model-value="handleChange"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </template>

    <FormField v-slot="{ value, handleChange }" name="penalty_type_id">
      <FormItem>
        <FormLabel>{{ t('modals.penalty.penaltyType') }}</FormLabel>
        <FormControl>
          <PenaltyTypeSelect
            :model-value="value"
            :penalty-types="penaltyTypes"
            @update:model-value="handleChange"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
