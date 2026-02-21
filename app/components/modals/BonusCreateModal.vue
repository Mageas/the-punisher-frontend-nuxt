<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { bonusService } from '~/services/bonus.service'

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
const { bonusTypes, fetchBonusTypes } = useAllBonusTypes()

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
  }),
)

const { handleSubmit, isSubmitting, resetForm, setFieldError, values, setFieldValue, meta } =
  useForm({
    validationSchema: schema,
    initialValues: {
      classroom_id: props.preselectedClassroomId ?? '',
      student_id: props.preselectedStudentId ?? '',
      bonus_type_id: '',
      points: 1,
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
        bonus_type_id: '',
        points: 1,
      },
    })
    await Promise.all([
      hasPreselectedStudent.value || hasPreselectedClassroom.value
        ? Promise.resolve()
        : fetchClassrooms(),
      fetchStudents(values.classroom_id || undefined),
      fetchBonusTypes(),
    ])
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  try {
    await bonusService.createBonus({
      student_id: formValues.student_id,
      bonus_type_id: formValues.bonus_type_id,
      points: formValues.points,
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
    :title="t('modals.bonus.title')"
    :global-error="globalError"
    :submitting="isSubmitting"
    :can-submit="meta.valid"
    :submit-text="t('modals.bonus.submit')"
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
          <FormLabel>{{ t('modals.bonus.class') }}</FormLabel>
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
          <FormLabel>{{ t('modals.bonus.student') }}</FormLabel>
          <FormControl>
            <StudentSelect
              :model-value="value"
              :students="students"
              :placeholder="t('modals.bonus.selectStudent')"
              :empty-text="t('modals.bonus.noStudentFound')"
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
          <BonusTypeSelect
            :model-value="value"
            :bonus-types="bonusTypes"
            @update:model-value="handleChange"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ componentField }" name="points">
      <FormItem>
        <FormLabel>{{ t('modals.bonus.points') }}</FormLabel>
        <FormControl>
          <Input
            v-bind="componentField"
            type="number"
            step="0.1"
            min="0"
            :placeholder="t('modals.bonus.pointsPlaceholder')"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
  </BaseModal>
</template>
