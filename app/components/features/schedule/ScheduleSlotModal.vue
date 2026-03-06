<script setup lang="ts">
import {
  SCHEDULE_WEEKDAYS,
  type ScheduleSlot,
  type ScheduleSlotCreateData,
  type Weekday,
  type WeekPattern,
} from '~/types/api'
import { Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  scheduleSlot?: ScheduleSlot | null
  prefillWeekday?: Weekday | null
  prefillStartTime?: string | null
  prefillEndTime?: string | null
  saveFn: (data: ScheduleSlotCreateData) => Promise<ScheduleSlot>
}>()

const emit = defineEmits<{
  saved: [slot: ScheduleSlot]
  delete: [slotId: string]
}>()

const open = defineModel<boolean>('open', { default: false })
const { t } = useI18n()
const classroomService = useClassroomService()
const { fieldErrors, globalError, handleApiError, clearErrors } = useApiErrors()

const isEditMode = computed(() => !!props.scheduleSlot)
const submitting = ref(false)

const weekdayOptions: readonly Weekday[] = SCHEDULE_WEEKDAYS

const weekPatternOptions: { value: WeekPattern; dotClass: string }[] = [
  { value: 'every_week', dotClass: 'bg-violet-500' },
  { value: 'even_weeks', dotClass: 'bg-info' },
  { value: 'odd_weeks', dotClass: 'bg-warning' },
]

const form = reactive({
  weekday: '' as Weekday | '',
  start_time: '',
  end_time: '',
  week_pattern: 'every_week' as WeekPattern,
  classroom_ids: [] as string[],
})

const selectedClassrooms = ref<{ id: string; name: string }[]>([])

watch(open, (isOpen) => {
  if (!isOpen) return

  clearErrors()

  if (props.scheduleSlot) {
    form.weekday = props.scheduleSlot.weekday
    form.start_time = props.scheduleSlot.start_time
    form.end_time = props.scheduleSlot.end_time
    form.week_pattern = props.scheduleSlot.week_pattern
    form.classroom_ids = props.scheduleSlot.classrooms.map((c) => c.id)
    selectedClassrooms.value = [...props.scheduleSlot.classrooms]
  } else {
    form.weekday = props.prefillWeekday || ''
    form.start_time = props.prefillStartTime || ''
    form.end_time =
      props.prefillEndTime || (props.prefillStartTime ? addMinutes(props.prefillStartTime, 55) : '')
    form.week_pattern = 'every_week'
    form.classroom_ids = []
    selectedClassrooms.value = []
  }
})

function addMinutes(time: string, minutes: number): string {
  const parts = time.split(':').map(Number)
  const total = (parts[0] ?? 0) * 60 + (parts[1] ?? 0) + minutes
  const nh = Math.floor(total / 60)
  const nm = total % 60
  return `${String(Math.min(nh, 23)).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

const timeOptions = computed(() => {
  const opts: string[] = []
  for (let h = 6; h <= 20; h++) {
    for (const m of [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]) {
      if (h === 20 && m > 0) break
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return opts
})

const endTimeOptions = computed(() => {
  if (!form.start_time) return timeOptions.value
  return timeOptions.value.filter((time) => time > form.start_time)
})

const canSubmit = computed(() => {
  return (
    form.weekday !== '' &&
    form.start_time !== '' &&
    form.end_time !== '' &&
    form.start_time < form.end_time
  )
})

async function fetchClassroomOptions(options: { page: number; search?: string }) {
  const response = await classroomService.getClassrooms(options)

  return {
    ...response,
    data: response.data.map((classroom) => ({
      id: classroom.id,
      name: classroom.name,
    })),
  }
}

async function handleSubmit() {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true
  clearErrors()

  try {
    const savedSlot = await props.saveFn({
      weekday: form.weekday as Weekday,
      start_time: form.start_time,
      end_time: form.end_time,
      week_pattern: form.week_pattern,
      classroom_ids: form.classroom_ids,
    })
    open.value = false
    emit('saved', savedSlot)
  } catch (err) {
    handleApiError(err)

    if (globalError.value) {
      toast.error(globalError.value, {
        position: 'top-center',
        richColors: true,
      })
      clearErrors()
    }
  } finally {
    submitting.value = false
  }
}

function handleDelete() {
  if (props.scheduleSlot) {
    emit('delete', props.scheduleSlot.id)
  }
}

function removeClassroom(id: string) {
  form.classroom_ids = form.classroom_ids.filter((cid) => cid !== id)
  selectedClassrooms.value = selectedClassrooms.value.filter((classroom) => classroom.id !== id)
}
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="isEditMode ? t('schedule.form.editTitle') : t('schedule.form.createTitle')"
    :submitting="submitting"
    :can-submit="canSubmit"
    :submit-text="isEditMode ? t('common.actions.save') : t('common.actions.create')"
    hide-footer
    prevent-auto-focus
    @submit="handleSubmit"
  >
    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-2">
        <Label>{{ t('schedule.form.weekday') }}</Label>
        <NativeSelect v-model="form.weekday" class="w-full">
          <NativeSelectOption value="" disabled>
            {{ t('schedule.form.selectWeekday') }}
          </NativeSelectOption>
          <NativeSelectOption v-for="day in weekdayOptions" :key="day" :value="day">
            {{ t(`schedule.weekdays.${day}`) }}
          </NativeSelectOption>
        </NativeSelect>
        <p v-if="fieldErrors.weekday" class="text-sm text-destructive">
          {{ fieldErrors.weekday }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <Label>{{ t('schedule.form.startTime') }}</Label>
          <NativeSelect v-model="form.start_time" class="w-full">
            <NativeSelectOption value="" disabled> --:-- </NativeSelectOption>
            <NativeSelectOption v-for="time in timeOptions" :key="time" :value="time">
              {{ time }}
            </NativeSelectOption>
          </NativeSelect>
          <p v-if="fieldErrors.start_time" class="text-sm text-destructive">
            {{ fieldErrors.start_time }}
          </p>
        </div>
        <div class="space-y-2">
          <Label>{{ t('schedule.form.endTime') }}</Label>
          <NativeSelect v-model="form.end_time" class="w-full">
            <NativeSelectOption value="" disabled> --:-- </NativeSelectOption>
            <NativeSelectOption v-for="time in endTimeOptions" :key="time" :value="time">
              {{ time }}
            </NativeSelectOption>
          </NativeSelect>
          <p v-if="fieldErrors.end_time" class="text-sm text-destructive">
            {{ fieldErrors.end_time }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <Label>{{ t('schedule.form.weekPattern') }}</Label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="opt in weekPatternOptions"
            :key="opt.value"
            type="button"
            :class="[
              'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all',
              form.week_pattern === opt.value
                ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted/50',
            ]"
            @click="form.week_pattern = opt.value"
          >
            <span :class="['h-2 w-2 shrink-0 rounded-full', opt.dotClass]" />
            {{ t(`schedule.weekPatternsShort.${opt.value}`) }}
          </button>
        </div>
        <p v-if="fieldErrors.week_pattern" class="text-sm text-destructive">
          {{ fieldErrors.week_pattern }}
        </p>
      </div>

      <div class="space-y-2">
        <Label>{{ t('schedule.form.classrooms') }}</Label>

        <div v-if="selectedClassrooms.length > 0" class="flex flex-wrap gap-1.5">
          <Badge
            v-for="classroom in selectedClassrooms"
            :key="classroom.id"
            variant="secondary"
            class="gap-1 pr-1"
          >
            {{ classroom.name }}
            <button
              type="button"
              class="ml-1 cursor-pointer rounded-full p-0.5 hover:bg-muted"
              @click="removeClassroom(classroom.id)"
            >
              <span class="sr-only">{{ t('common.actions.remove') }}</span>
              <svg
                class="h-3 w-3"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          </Badge>
        </div>

        <p v-else class="text-sm text-muted-foreground">
          {{ t('schedule.form.noClassroomSelected') }}
        </p>

        <IdNameSelect
          :model-value="''"
          :fetch-options="fetchClassroomOptions"
          :placeholder="t('schedule.form.classroomPlaceholder')"
          :search-placeholder="t('schedule.form.classroomSearch')"
          :empty-text="t('schedule.form.classroomEmpty')"
          keep-focus-on-select
          @selected-option="
            (opt: { id: string; name: string } | null) => {
              if (opt && !form.classroom_ids.includes(opt.id)) {
                form.classroom_ids.push(opt.id)
                selectedClassrooms.push({ id: opt.id, name: opt.name })
              }
            }
          "
        />
        <p v-if="fieldErrors.classroom_ids" class="text-sm text-destructive">
          {{ fieldErrors.classroom_ids }}
        </p>
      </div>

      <div class="flex items-center gap-2 pt-2">
        <Button
          v-if="isEditMode"
          type="button"
          variant="ghost"
          size="icon"
          class="cursor-pointer text-danger hover:text-danger"
          :title="t('common.actions.delete')"
          :disabled="submitting"
          @click="handleDelete"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
        <div class="flex-1" />
        <Button
          type="button"
          variant="outline"
          class="cursor-pointer"
          :disabled="submitting"
          @click="open = false"
        >
          {{ t('common.actions.cancel') }}
        </Button>
        <Button type="submit" class="cursor-pointer" :disabled="submitting || !canSubmit">
          <span
            v-if="submitting"
            class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          {{ isEditMode ? t('common.actions.save') : t('common.actions.create') }}
        </Button>
      </div>
    </form>
  </BaseModal>
</template>
