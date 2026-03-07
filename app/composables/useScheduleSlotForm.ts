import type { MaybeRefOrGetter, Ref } from 'vue'
import {
  SCHEDULE_WEEKDAYS,
  type ScheduleSlot,
  type ScheduleSlotClassroom,
  type ScheduleSlotCreateData,
  type Weekday,
} from '~/types/api'
import { getScheduleSlotFormErrors, type ScheduleSlotFormValues } from '~/lib/schedule-slot-form'
import { SCHEDULE_WEEK_PATTERN_VISUALS } from '~/lib/schedule-week-patterns'

interface UseScheduleSlotFormOptions {
  open: Readonly<Ref<boolean>>
  scheduleSlot?: MaybeRefOrGetter<ScheduleSlot | null | undefined>
  prefillWeekday?: MaybeRefOrGetter<Weekday | null | undefined>
  prefillStartTime?: MaybeRefOrGetter<string | null | undefined>
  prefillEndTime?: MaybeRefOrGetter<string | null | undefined>
  clearErrors: () => void
  t: (key: string, params?: Record<string, unknown>) => string
}

function addMinutes(time: string, minutes: number): string {
  const parts = time.split(':').map(Number)
  const total = (parts[0] ?? 0) * 60 + (parts[1] ?? 0) + minutes
  const nextHour = Math.floor(total / 60)
  const nextMinute = total % 60

  return `${String(Math.min(nextHour, 23)).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`
}

export function useScheduleSlotForm(options: UseScheduleSlotFormOptions) {
  const classroomService = useClassroomService()
  const hasAttemptedSubmit = ref(false)
  const weekdayOptions: readonly Weekday[] = SCHEDULE_WEEKDAYS
  const weekPatternOptions = SCHEDULE_WEEK_PATTERN_VISUALS

  const form = reactive<ScheduleSlotFormValues>({
    weekday: '',
    start_time: '',
    end_time: '',
    week_pattern: 'every_week',
    classroom_ids: [],
  })

  const selectedClassrooms = ref<ScheduleSlotClassroom[]>([])

  const timeOptions = computed(() => {
    const optionsForTime: string[] = []

    for (let hour = 6; hour <= 20; hour++) {
      for (const minute of [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]) {
        if (hour === 20 && minute > 0) break
        optionsForTime.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
      }
    }

    return optionsForTime
  })

  const endTimeOptions = computed(() => {
    if (!form.start_time) return timeOptions.value

    return timeOptions.value.filter((time) => time > form.start_time)
  })

  const clientErrors = computed(() =>
    hasAttemptedSubmit.value ? getScheduleSlotFormErrors(form, options.t) : {},
  )

  function applyScheduleSlot(slot: ScheduleSlot) {
    form.weekday = slot.weekday
    form.start_time = slot.start_time
    form.end_time = slot.end_time
    form.week_pattern = slot.week_pattern
    form.classroom_ids = slot.classrooms.map((classroom) => classroom.id)
    selectedClassrooms.value = [...slot.classrooms]
  }

  function applyCreateDefaults() {
    const prefillStartTime = toValue(options.prefillStartTime) || ''
    const prefillEndTime = toValue(options.prefillEndTime)

    form.weekday = toValue(options.prefillWeekday) || ''
    form.start_time = prefillStartTime
    form.end_time = prefillEndTime || (prefillStartTime ? addMinutes(prefillStartTime, 55) : '')
    form.week_pattern = 'every_week'
    form.classroom_ids = []
    selectedClassrooms.value = []
  }

  function initializeForm() {
    const scheduleSlot = toValue(options.scheduleSlot)

    if (scheduleSlot) {
      applyScheduleSlot(scheduleSlot)
      return
    }

    applyCreateDefaults()
  }

  async function fetchClassroomOptions(params: { page: number; search?: string }) {
    const response = await classroomService.getClassrooms(params)

    return {
      ...response,
      data: response.data.map((classroom) => ({
        id: classroom.id,
        name: classroom.name,
      })),
    }
  }

  function addClassroom(classroom: ScheduleSlotClassroom | null) {
    if (!classroom || form.classroom_ids.includes(classroom.id)) return

    form.classroom_ids.push(classroom.id)
    selectedClassrooms.value.push({
      id: classroom.id,
      name: classroom.name,
    })
  }

  function removeClassroom(id: string) {
    form.classroom_ids = form.classroom_ids.filter((classroomId) => classroomId !== id)
    selectedClassrooms.value = selectedClassrooms.value.filter((classroom) => classroom.id !== id)
  }

  function validateForm() {
    hasAttemptedSubmit.value = true
    return Object.keys(getScheduleSlotFormErrors(form, options.t)).length === 0
  }

  function getSubmitData(): ScheduleSlotCreateData {
    return {
      weekday: form.weekday as Weekday,
      start_time: form.start_time,
      end_time: form.end_time,
      week_pattern: form.week_pattern,
      classroom_ids: [...form.classroom_ids],
    }
  }

  watch(
    () => options.open.value,
    (isOpen) => {
      hasAttemptedSubmit.value = false

      if (!isOpen) return

      options.clearErrors()
      initializeForm()
    },
  )

  return {
    form,
    selectedClassrooms,
    weekdayOptions,
    weekPatternOptions,
    timeOptions,
    endTimeOptions,
    clientErrors,
    fetchClassroomOptions,
    addClassroom,
    removeClassroom,
    validateForm,
    getSubmitData,
  }
}
