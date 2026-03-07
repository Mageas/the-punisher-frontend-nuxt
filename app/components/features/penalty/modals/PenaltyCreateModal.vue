<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as zod from 'zod'
import type { DateValue } from '@internationalized/date'
import { getLocalTimeZone } from '@internationalized/date'
import { Check, Info } from 'lucide-vue-next'
import type { Student } from '~/types/api'
import { toApiDateTimeString } from '~/lib/date-time'
import { resolvePenaltyClassroomSelection } from '~/lib/penalty-classroom'

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
      if (selectedStudentClassrooms.value.length > 1 && !value.classroom_id) {
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
  () => requiresStudentClassroomSelection.value && !values.classroom_id,
)
const canSubmit = computed(
  () =>
    meta.value.valid && !loadingSelectedStudentClassrooms.value && !isStudentClassroomMissing.value,
)

async function loadSelectedStudentClassrooms(studentId: string) {
  const requestId = ++classroomLookupRequestId
  loadingSelectedStudentClassrooms.value = true

  try {
    const student = await studentService.getStudentById(studentId)

    if (requestId !== classroomLookupRequestId) return

    selectedStudentClassrooms.value = student.classrooms
    setFieldError('classroom_id', undefined)

    const { classroomId } = resolvePenaltyClassroomSelection(student.classrooms, {
      currentClassroomId: values.classroom_id,
      preferredClassroomId: values.student_lookup_classroom_id || null,
    })

    setFieldValue('classroom_id', classroomId, false)
  } catch {
    if (requestId !== classroomLookupRequestId) return

    selectedStudentClassrooms.value = []
    setFieldError('classroom_id', undefined)
    setFieldValue(
      'classroom_id',
      hasPreselectedStudent.value ? '' : values.student_lookup_classroom_id || '',
      false,
    )
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
    setFieldValue('classroom_id', nextClassroomId || '', false)
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
      setFieldValue(
        'classroom_id',
        hasPreselectedStudent.value ? '' : values.student_lookup_classroom_id || '',
        false,
      )
      return
    }

    await loadSelectedStudentClassrooms(studentId)
  },
)

watch(
  () => values.classroom_id,
  (classroomId) => {
    if (classroomId) {
      setFieldError('classroom_id', undefined)
    }
  },
)

// Load data when modal opens
watch(open, async (isOpen) => {
  if (isOpen) {
    clearErrors()
    selectedStudentClassrooms.value = []
    classroomLookupRequestId += 1
    loadingSelectedStudentClassrooms.value = false
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
      ...(formValues.classroom_id ? { classroom_id: formValues.classroom_id } : {}),
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

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="shouldShowStudentClassroomSelect"
        class="rounded-lg border border-info-border bg-info-bg-subtle p-3.5 space-y-3"
      >
        <div class="flex items-start gap-2.5">
          <Info class="size-4 mt-0.5 text-info-foreground shrink-0" />
          <p class="text-sm text-info-foreground leading-snug">
            {{ t('modals.penalty.studentClassroomPickHint') }}
          </p>
        </div>

        <FormField v-slot="{ value, handleChange }" name="classroom_id">
          <FormItem class="space-y-0">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="classroom in studentClassroomOptions"
                :key="classroom.id"
                type="button"
                :disabled="loadingSelectedStudentClassrooms"
                :class="[
                  'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  value === classroom.id
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-primary-bg-subtle',
                ]"
                @click="handleChange(classroom.id)"
              >
                <Check v-if="value === classroom.id" class="size-3.5" />
                {{ classroom.name }}
              </button>
            </div>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>
    </Transition>

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
          <FormMessage />
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
