<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone } from '@internationalized/date'
import type { Student } from '~/types/api'
import { toApiDateTimeString } from '~/lib/date-time'
import { resolveStudentClassroomSelection } from '~/lib/student-classroom'

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
const penaltyService = usePenaltyService()
const studentService = useStudentService()

const hasPreselectedStudent = computed(() => !!props.preselectedStudentId)
const hasPreselectedClassroom = computed(() => !!props.preselectedClassroomId)
const selectedStudentClassrooms = ref<Student['classrooms']>([])
const loadingSelectedStudentClassrooms = ref(false)
const selectedStudentClassroomId = ref('')
const isStudentClassroomDrawerOpen = ref(false)
let classroomLookupRequestId = 0

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
    .superRefine((value, ctx) => {
      if (selectedStudentClassrooms.value.length > 1 && !selectedStudentClassroomId.value) {
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

const { handleSubmit, isSubmitting, resetForm, setFieldError, values, setFieldValue, meta } =
  useForm({
    validationSchema: schema,
    initialValues: getInitialValues(),
  })

const studentClassroomOptions = computed(() =>
  selectedStudentClassrooms.value.map((classroom) => ({
    id: classroom.id,
    name: classroom.name,
  })),
)
const requiresStudentClassroomSelection = computed(() => selectedStudentClassrooms.value.length > 1)
const shouldShowStudentClassroomSelect = computed(() => requiresStudentClassroomSelection.value)
const isStudentClassroomMissing = computed(
  () => requiresStudentClassroomSelection.value && !selectedStudentClassroomId.value,
)
const canSubmit = computed(
  () =>
    meta.value.valid && !loadingSelectedStudentClassrooms.value && !isStudentClassroomMissing.value,
)

function syncStudentClassroomDrawerState(classroomId: string) {
  isStudentClassroomDrawerOpen.value = selectedStudentClassrooms.value.length > 1 && !classroomId
}

function selectStudentClassroom(classroomId: string) {
  selectedStudentClassroomId.value = classroomId
  setFieldValue('classroom_id', classroomId, false)
  isStudentClassroomDrawerOpen.value = false
}

async function loadSelectedStudentClassrooms(studentId: string) {
  const requestId = ++classroomLookupRequestId
  loadingSelectedStudentClassrooms.value = true

  try {
    const student = await studentService.getStudentById(studentId)

    if (requestId !== classroomLookupRequestId) return

    selectedStudentClassrooms.value = student.classrooms
    setFieldError('classroom_id', undefined)

    const { classroomId } = resolveStudentClassroomSelection(student.classrooms, {
      currentClassroomId: selectedStudentClassroomId.value,
      preferredClassroomId: values.student_lookup_classroom_id || null,
    })

    selectedStudentClassroomId.value = classroomId
    setFieldValue('classroom_id', classroomId, false)
    syncStudentClassroomDrawerState(classroomId)
  } catch {
    if (requestId !== classroomLookupRequestId) return

    selectedStudentClassrooms.value = []
    setFieldError('classroom_id', undefined)
    isStudentClassroomDrawerOpen.value = false
    selectedStudentClassroomId.value = hasPreselectedStudent.value
      ? ''
      : values.student_lookup_classroom_id || ''
    setFieldValue('classroom_id', selectedStudentClassroomId.value, false)
  } finally {
    if (requestId === classroomLookupRequestId) {
      loadingSelectedStudentClassrooms.value = false
    }
  }
}

// When the classroom filter changes, reset student selection and the resolved classroom.
watch(
  () => values.student_lookup_classroom_id,
  (nextClassroomId) => {
    if (!open.value) return
    if (hasPreselectedStudent.value) return

    selectedStudentClassrooms.value = []
    setFieldError('classroom_id', undefined)
    isStudentClassroomDrawerOpen.value = false
    selectedStudentClassroomId.value = nextClassroomId || ''
    setFieldValue('classroom_id', selectedStudentClassroomId.value, false)
    setFieldValue('student_id', '', false)
  },
)

watch(
  () => values.student_id,
  async (studentId) => {
    if (!open.value) return

    if (!studentId) {
      classroomLookupRequestId += 1
      loadingSelectedStudentClassrooms.value = false
      selectedStudentClassrooms.value = []
      setFieldError('classroom_id', undefined)
      isStudentClassroomDrawerOpen.value = false
      selectedStudentClassroomId.value = hasPreselectedStudent.value
        ? ''
        : values.student_lookup_classroom_id || ''
      setFieldValue('classroom_id', selectedStudentClassroomId.value, false)
      return
    }

    await loadSelectedStudentClassrooms(studentId)
  },
)

watch(selectedStudentClassroomId, (classroomId) => {
  if (classroomId) {
    setFieldError('classroom_id', undefined)
    if (selectedStudentClassrooms.value.length > 1) {
      isStudentClassroomDrawerOpen.value = false
    }
  }
})

// Load data when modal opens
watch(open, async (isOpen) => {
  if (isOpen) {
    clearErrors()
    selectedStudentClassrooms.value = []
    classroomLookupRequestId += 1
    loadingSelectedStudentClassrooms.value = false
    isStudentClassroomDrawerOpen.value = false
    selectedStudentClassroomId.value = props.preselectedStudentId
      ? ''
      : (props.preselectedClassroomId ?? '')
    setFieldError('classroom_id', undefined)
    resetForm({ values: getInitialValues() })

    if (props.preselectedStudentId) {
      await loadSelectedStudentClassrooms(props.preselectedStudentId)
    }
    return
  }

  classroomLookupRequestId += 1
  loadingSelectedStudentClassrooms.value = false
  selectedStudentClassrooms.value = []
  isStudentClassroomDrawerOpen.value = false
  selectedStudentClassroomId.value = ''
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

    await penaltyService.createPenalty({
      student_id: formValues.student_id,
      penalty_type_id: formValues.penalty_type_id,
      ...(selectedStudentClassroomId.value
        ? { classroom_id: selectedStudentClassroomId.value }
        : {}),
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
    :title="t('modals.penalty.title')"
    :global-error="globalError"
    :submitting="isSubmitting"
    :can-submit="canSubmit"
    :submit-text="t('common.actions.submit')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <template v-if="!hasPreselectedStudent">
      <FormField
        v-if="!hasPreselectedClassroom"
        v-slot="{ value }"
        name="student_lookup_classroom_id"
      >
        <FormItem>
          <FormLabel>{{ t('common.labels.classroom') }}</FormLabel>
          <FormControl>
            <ClassroomSelect
              :model-value="value"
              full-width
              @update:model-value="setFieldValue('student_lookup_classroom_id', $event, false)"
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
              :key="values.student_lookup_classroom_id || '__all_students__'"
              :model-value="value"
              :classroom-id="values.student_lookup_classroom_id || null"
              :options-scope-key="values.student_lookup_classroom_id || '__all_students__'"
              :placeholder="t('common.placeholders.selectStudent')"
              :empty-text="t('common.empty.noStudents')"
              @update:model-value="handleChange"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </template>

    <FormField v-if="shouldShowStudentClassroomSelect" v-slot="{}" name="classroom_id">
      <FormItem class="space-y-0">
        <StudentClassroomSelector
          v-model:open="isStudentClassroomDrawerOpen"
          :classrooms="studentClassroomOptions"
          :selected-classroom-id="selectedStudentClassroomId"
          :loading="loadingSelectedStudentClassrooms"
          :hint="t('modals.penalty.studentClassroomPickHint')"
          @select="selectStudentClassroom"
        />
        <FormMessage />
      </FormItem>
    </FormField>

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
