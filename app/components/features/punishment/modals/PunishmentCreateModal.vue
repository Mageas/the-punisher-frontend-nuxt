<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { NextLesson, Student } from '~/types/api'
import { toApiDateTimeString } from '~/lib/date-time'
import {
  resolvePunishmentDueAtFromNextLesson,
  resolveSelectedNextLessonKey,
} from '~/lib/punishment-next-lesson'
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
const { isPending: submitLoading, withPending: withSubmitLoading } = useApiActionState()
const punishmentService = usePunishmentService()
const studentService = useStudentService()
const scheduleService = useScheduleService()

const hasPreselectedStudent = computed(() => !!props.preselectedStudentId)
const hasPreselectedClassroom = computed(() => !!props.preselectedClassroomId)
const selectedStudentClassrooms = ref<Student['classrooms']>([])
const loadingSelectedStudentClassrooms = ref(false)
const selectedStudentClassroomId = ref('')
const nextLessons = ref<NextLesson[]>([])
const loadingNextLessons = ref(false)
const isStudentClassroomDrawerOpen = ref(false)
const isNextLessonsDrawerOpen = ref(false)
let classroomLookupRequestId = 0
let nextLessonsRequestId = 0

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
    punishment_type_id: '',
    due_at: undefined as DateValue | undefined,
    due_at_time: '08:00',
    occurred_at: undefined as DateValue | undefined,
    occurred_at_time: '08:00',
    evaluation_label: '',
  }
}

const { handleSubmit, resetForm, setFieldError, values, setFieldValue, meta } = useForm({
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
const shouldShowNextLessonSuggestions = computed(
  () => !!values.student_id && (!!selectedStudentClassroomId.value || loadingNextLessons.value),
)
const isStudentClassroomMissing = computed(
  () => requiresStudentClassroomSelection.value && !selectedStudentClassroomId.value,
)
const canSubmit = computed(
  () =>
    meta.value.valid && !loadingSelectedStudentClassrooms.value && !isStudentClassroomMissing.value,
)
const selectedNextLessonKey = computed(() =>
  resolveSelectedNextLessonKey(nextLessons.value, {
    dueAt: values.due_at as DateValue | undefined,
    dueAtTime: values.due_at_time,
  }),
)

function resetNextLessonsState() {
  nextLessonsRequestId += 1
  loadingNextLessons.value = false
  nextLessons.value = []
  isNextLessonsDrawerOpen.value = false
}

function syncStudentClassroomDrawerState(classroomId: string) {
  isStudentClassroomDrawerOpen.value = selectedStudentClassrooms.value.length > 1 && !classroomId
}

function syncNextLessonsDrawerState(lessons: readonly NextLesson[]) {
  if (loadingNextLessons.value || lessons.length === 0) {
    isNextLessonsDrawerOpen.value = true
    return
  }

  isNextLessonsDrawerOpen.value = !resolveSelectedNextLessonKey(lessons, {
    dueAt: values.due_at as DateValue | undefined,
    dueAtTime: values.due_at_time,
  })
}

function selectStudentClassroom(classroomId: string) {
  selectedStudentClassroomId.value = classroomId
  setFieldValue('classroom_id', classroomId, false)
  isStudentClassroomDrawerOpen.value = false
}

function applyNextLesson(lesson: NextLesson) {
  const dueSelection = resolvePunishmentDueAtFromNextLesson(lesson)
  if (!dueSelection) return

  setFieldValue('due_at', dueSelection.dueAt, false)
  setFieldValue('due_at_time', dueSelection.dueAtTime, false)
  setFieldError('due_at', undefined)
  setFieldError('due_at_time', undefined)
  isNextLessonsDrawerOpen.value = false
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

async function loadNextLessons(classroomId: string) {
  const requestId = ++nextLessonsRequestId
  loadingNextLessons.value = true

  try {
    const lessons = await scheduleService.getClassroomNextLessons(classroomId)

    if (requestId !== nextLessonsRequestId) return

    nextLessons.value = lessons
  } catch {
    if (requestId !== nextLessonsRequestId) return

    nextLessons.value = []
    isNextLessonsDrawerOpen.value = true
  } finally {
    if (requestId === nextLessonsRequestId) {
      loadingNextLessons.value = false
      syncNextLessonsDrawerState(nextLessons.value)
    }
  }
}

// When the classroom filter changes, reset the student selection and the resolved classroom.
watch(
  () => values.student_lookup_classroom_id,
  (nextClassroomId) => {
    if (!open.value) return
    if (hasPreselectedStudent.value) return

    classroomLookupRequestId += 1
    loadingSelectedStudentClassrooms.value = false
    selectedStudentClassrooms.value = []
    setFieldError('classroom_id', undefined)
    isStudentClassroomDrawerOpen.value = false
    resetNextLessonsState()
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
      resetNextLessonsState()
      selectedStudentClassroomId.value = hasPreselectedStudent.value
        ? ''
        : values.student_lookup_classroom_id || ''
      setFieldValue('classroom_id', selectedStudentClassroomId.value, false)
      return
    }

    await loadSelectedStudentClassrooms(studentId)
  },
)

watch(selectedStudentClassroomId, async (classroomId) => {
  if (!open.value) return

  if (classroomId) {
    setFieldError('classroom_id', undefined)
  }

  if (!values.student_id || !classroomId) {
    resetNextLessonsState()
    return
  }

  if (selectedStudentClassrooms.value.length > 1) {
    isStudentClassroomDrawerOpen.value = false
  }

  await loadNextLessons(classroomId)
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
    resetNextLessonsState()
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
  setFieldError('classroom_id', undefined)
  resetNextLessonsState()
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()

  if (isStudentClassroomMissing.value) {
    setFieldError('classroom_id', t('apiErrors.details.punishment_classroom_not_resolved'))
    return
  }

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

    await withSubmitLoading(async () => {
      await punishmentService.createPunishment({
        student_id: formValues.student_id,
        punishment_type_id: formValues.punishment_type_id,
        due_at: dueAt,
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
    :title="t('modals.punishment.title')"
    :global-error="globalError"
    :submitting="submitLoading"
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
          :hint="t('modals.punishment.studentClassroomPickHint')"
          @select="selectStudentClassroom"
        />
        <FormMessage />
      </FormItem>
    </FormField>

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
          <FormLabel>{{ t('common.labels.dueAt') }}</FormLabel>
          <FormControl>
            <DatePicker
              :model-value="dateValue"
              :time="timeValue"
              :placeholder="t('common.placeholders.selectDate')"
              show-time
              @update:model-value="handleChangeDate"
              @update:time="handleChangeTime"
            />
          </FormControl>
          <FormMessage name="due_at" />
        </FormItem>
      </FormField>
    </FormField>

    <NextLessonSelector
      v-if="shouldShowNextLessonSuggestions"
      v-model:open="isNextLessonsDrawerOpen"
      :lessons="nextLessons"
      :selected-lesson-key="selectedNextLessonKey"
      :loading="loadingNextLessons"
      :title="t('modals.punishment.nextLessonsTitle')"
      :hint="t('modals.punishment.nextLessonsHint')"
      :empty-text="t('modals.punishment.nextLessonsEmpty')"
      @select="applyNextLesson"
    />

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
