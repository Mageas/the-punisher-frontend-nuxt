<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import { getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import type { NextLesson } from '~/types/api'
import { applyTimeInputToDate, toApiDateTimeString } from '~/lib/date-time'
import {
  resolvePunishmentDueAtFromNextLesson,
  resolveSelectedNextLessonKey,
} from '~/lib/punishment-next-lesson'

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
const scheduleService = useScheduleService()
const { notifyCreateSuccess } = useActionToast()

const nextLessons = ref<NextLesson[]>([])
const loadingNextLessons = ref(false)
const isNextLessonsDrawerOpen = ref(false)
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

const shouldShowNextLessonSuggestions = computed(
  () => !!values.student_id && (!!selectedStudentClassroomId.value || loadingNextLessons.value),
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

function applyNextLesson(lesson: NextLesson) {
  const dueSelection = resolvePunishmentDueAtFromNextLesson(lesson)
  if (!dueSelection) return

  setFieldValue('due_at', dueSelection.dueAt, false)
  setFieldValue('due_at_time', dueSelection.dueAtTime, false)
  setFieldError('due_at', undefined)
  setFieldError('due_at_time', undefined)
  isNextLessonsDrawerOpen.value = false
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

watch(
  [() => open.value, () => values.student_id, selectedStudentClassroomId],
  async ([isOpen, studentId, classroomId]) => {
    if (!isOpen) return

    if (!studentId || !classroomId) {
      resetNextLessonsState()
      return
    }

    await loadNextLessons(classroomId)
  },
)

// Load data when modal opens
watch(open, async (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetNextLessonsState()
    resetForm({ values: getInitialValues() })
    await initializeResolvedStudentClassroomSelection()
    return
  }

  cleanupResolvedStudentClassroomSelection()
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
    applyTimeInputToDate(date, formValues.due_at_time)
    const dueAt = toApiDateTimeString(date) ?? undefined

    let occurredAt: string | undefined
    if (formValues.occurred_at) {
      const occurredDate = (formValues.occurred_at as DateValue).toDate(getLocalTimeZone())
      applyTimeInputToDate(occurredDate, formValues.occurred_at_time)
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
    :title="t('modals.punishment.title')"
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
      :hint="t('modals.punishment.studentClassroomPickHint')"
      @select="selectStudentClassroom"
    />

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
      <FormItem>
        <FormLabel>{{ t('common.labels.dueAt') }}</FormLabel>
        <FormControl>
          <DatePicker
            :model-value="dateValue"
            :time="values.due_at_time"
            :placeholder="t('common.placeholders.selectDate')"
            show-time
            @update:model-value="handleChangeDate"
            @update:time="(value) => setFieldValue('due_at_time', value, false)"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
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
