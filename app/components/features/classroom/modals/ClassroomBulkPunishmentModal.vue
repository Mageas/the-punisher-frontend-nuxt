<script setup lang="ts">
import { getLocalTimeZone } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as zod from 'zod'
import { applyTimeInputToDate, toApiDateTimeString } from '~/lib/date-time'
import {
  resolvePunishmentDueAtFromNextLesson,
  resolveSelectedNextLessonKey,
} from '~/lib/punishment-next-lesson'
import type { NextLesson, Student } from '~/types/api'

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
const punishmentService = usePunishmentService()
const scheduleService = useScheduleService()
const { notifyCreateSuccess } = useActionToast()

const submitLoading = ref(false)
const nextLessons = ref<NextLesson[]>([])
const loadingNextLessons = ref(false)
const isNextLessonsDrawerOpen = ref(false)
let nextLessonsRequestId = 0

const schema = toTypedSchema(
  zod.object({
    punishment_type_id: zod
      .string()
      .min(1, t('apiErrors.details.validation_field_required'))
      .uuid(
        t('apiErrors.details.validation_malformed_parameter', {
          value: 'UUID',
        }),
      ),
    due_at: zod.any().refine((value) => !!value, t('apiErrors.details.validation_field_required')),
    due_at_time: zod.string().min(1, t('apiErrors.details.validation_field_required')),
    occurred_at: zod.any().optional(),
    occurred_at_time: zod.string().optional(),
    evaluation_label: zod.string().optional(),
  }),
)

function getInitialValues() {
  return {
    punishment_type_id: '',
    due_at: undefined as DateValue | undefined,
    due_at_time: '08:00',
    occurred_at: undefined as DateValue | undefined,
    occurred_at_time: '08:00',
    evaluation_label: '',
  }
}

const { handleSubmit, resetForm, setFieldError, setFieldValue, values, meta } = useForm({
  validationSchema: schema,
  initialValues: getInitialValues(),
})

const studentNames = computed(() =>
  props.students.map((student) => `${student.first_name} ${student.last_name}`).join(', '),
)
const selectedNextLessonKey = computed(() =>
  resolveSelectedNextLessonKey(nextLessons.value, {
    dueAt: values.due_at as DateValue | undefined,
    dueAtTime: values.due_at_time,
  }),
)
const shouldShowNextLessonSuggestions = computed(() => !!props.classroomId)

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

watch(open, async (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetNextLessonsState()
    resetForm({ values: getInitialValues() })

    if (props.classroomId) {
      await loadNextLessons(props.classroomId)
    }

    return
  }

  resetNextLessonsState()
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  submitLoading.value = true

  try {
    const dueDate = (formValues.due_at as DateValue).toDate(getLocalTimeZone())
    applyTimeInputToDate(dueDate, formValues.due_at_time)
    const dueAt = toApiDateTimeString(dueDate) ?? undefined

    let occurredAt: string | undefined
    if (formValues.occurred_at) {
      const occurredDate = (formValues.occurred_at as DateValue).toDate(getLocalTimeZone())
      applyTimeInputToDate(occurredDate, formValues.occurred_at_time)
      occurredAt = toApiDateTimeString(occurredDate) ?? undefined
    }

    const evaluationLabel = formValues.evaluation_label?.trim()
    await punishmentService.createBulkPunishments(props.classroomId, {
      student_ids: props.students.map((student) => student.id),
      punishment_type_id: formValues.punishment_type_id,
      due_at: dueAt,
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
    :title="t('classProfile.bulkPunishment.title')"
    :global-error="globalError"
    :submitting="submitLoading"
    :can-submit="meta.valid"
    :submit-text="submitLoading ? t('common.loading') : t('common.actions.submit')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <div class="rounded-lg border border-border bg-muted/50 px-3 py-2.5">
      <p class="text-sm font-medium text-muted-foreground">
        {{ t('classProfile.bulkPunishment.selectedStudents', students.length) }}
      </p>
      <p class="mt-1 text-sm leading-relaxed line-clamp-3">
        {{ studentNames }}
      </p>
    </div>

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
