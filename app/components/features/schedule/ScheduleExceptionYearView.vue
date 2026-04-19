<script setup lang="ts">
import type { DateValue } from '@internationalized/date'
import type { ScheduleException } from '~/types/api'
import { CalendarDate, getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { createMonth } from 'reka-ui/date'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const { t } = useI18n()

const props = defineProps<{
  exceptions: ScheduleException[]
}>()

const emit = defineEmits<{
  editException: [exception: ScheduleException]
}>()

const modelValue = defineModel<{ start: DateValue | undefined; end: DateValue | undefined }>()
const currentYear = ref(today(getLocalTimeZone()).year)
const todayDate = today(getLocalTimeZone())

const weekDayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long' })

const months = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const dateObj = new CalendarDate(currentYear.value, month, 1)
    const grid = createMonth({
      dateObj,
      weekStartsOn: 1,
      fixedWeeks: true,
      locale: 'fr-FR',
    })
    return {
      month,
      label: monthFormatter.format(new Date(currentYear.value, month - 1, 1)),
      grid,
    }
  })
})

function isToday(date: DateValue): boolean {
  return date.compare(todayDate) === 0
}

function isCurrentMonth(date: DateValue, month: number): boolean {
  return date.month === month
}

function isInteractiveDate(date: DateValue, month: number): boolean {
  return isCurrentMonth(date, month)
}

function getExceptionType(date: DateValue): 'vacation' | 'public_holiday' | null {
  return getExceptionForDate(date)?.type ?? null
}

function getExceptionForDate(date: DateValue): ScheduleException | null {
  for (const exception of props.exceptions) {
    const start = parseDate(exception.start_date)
    const end = parseDate(exception.end_date)
    if (date.compare(start) >= 0 && date.compare(end) <= 0) {
      return exception
    }
  }
  return null
}

function getNormalizedSelection() {
  const start = modelValue.value?.start
  const end = modelValue.value?.end

  if (!start) return null
  if (!end) return { start, end: start }

  return start.compare(end) <= 0 ? { start, end } : { start: end, end: start }
}

function isSelected(date: DateValue, month: number): boolean {
  if (!isInteractiveDate(date, month)) return false

  const selection = getNormalizedSelection()
  if (!selection) return false

  return date.compare(selection.start) >= 0 && date.compare(selection.end) <= 0
}

function isSelectionBoundary(date: DateValue, month: number): boolean {
  if (!isInteractiveDate(date, month)) return false

  const selection = getNormalizedSelection()
  if (!selection) return false

  return date.compare(selection.start) === 0 || date.compare(selection.end) === 0
}

function selectDate(date: DateValue, month: number) {
  if (!isInteractiveDate(date, month)) return

  const exception = getExceptionForDate(date)
  const start = modelValue.value?.start
  const end = modelValue.value?.end

  if (exception && !start && !end) {
    emit('editException', exception)
    return
  }

  if (!start || end) {
    modelValue.value = { start: date, end: undefined }
    return
  }

  if (date.compare(start) <= 0) {
    modelValue.value = { start: date, end: start }
    return
  }

  modelValue.value = { start, end: date }
}

function getCellClass(date: DateValue, month: number): string {
  const inMonth = isInteractiveDate(date, month)
  if (!inMonth) return 'text-muted-foreground/30'

  const exType = getExceptionType(date)
  const isDateToday = isToday(date)

  if (exType === 'vacation') {
    return cn(
      'bg-schedule-vacation-bg text-schedule-vacation-foreground rounded-sm',
      isDateToday && 'ring-1 ring-schedule-vacation-ring',
    )
  }
  if (exType === 'public_holiday') {
    return cn(
      'bg-schedule-holiday-bg text-schedule-holiday-foreground rounded-sm',
      isDateToday && 'ring-1 ring-schedule-holiday-ring',
    )
  }

  if (isDateToday) return 'bg-primary text-primary-foreground rounded-sm'
  return 'text-foreground'
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="icon"
        class="h-8 w-8 cursor-pointer"
        :aria-label="t('schedule.exceptions.previousYear')"
        @click="currentYear--"
      >
        <ChevronLeft class="h-4 w-4" />
      </Button>
      <span class="text-lg font-semibold tabular-nums">{{ currentYear }}</span>
      <Button
        variant="outline"
        size="icon"
        class="h-8 w-8 cursor-pointer"
        :aria-label="t('schedule.exceptions.nextYear')"
        @click="currentYear++"
      >
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="m in months" :key="m.month" class="rounded-lg border bg-card p-3">
        <h2 class="mb-2 text-center text-sm font-medium capitalize">
          {{ m.label }}
        </h2>
        <div class="grid grid-cols-7 gap-px text-center text-xs">
          <div
            v-for="(day, index) in weekDayLabels"
            :key="index"
            class="py-1 font-medium text-muted-foreground"
          >
            {{ day }}
          </div>
          <template v-for="(week, wi) in m.grid.rows" :key="wi">
            <template v-for="(date, di) in week" :key="`${wi}-${di}`">
              <button
                v-if="isInteractiveDate(date, m.month)"
                type="button"
                :aria-label="`${date.day} ${m.label} ${currentYear}`"
                :data-selected="isSelected(date, m.month) ? 'true' : undefined"
                :data-boundary="isSelectionBoundary(date, m.month) ? 'true' : undefined"
                :class="
                  cn(
                    'flex h-6 w-full items-center justify-center rounded-sm text-xs transition-colors',
                    'cursor-pointer hover:bg-calendar-hover-bg hover:text-calendar-hover-foreground',
                    'focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-2',
                    'data-[selected=true]:bg-calendar-selection-bg data-[selected=true]:text-calendar-selection-foreground',
                    'data-[boundary=true]:!bg-calendar-selection-boundary data-[boundary=true]:!text-calendar-selection-boundary-foreground',
                    getCellClass(date, m.month),
                  )
                "
                @click="selectDate(date, m.month)"
              >
                {{ date.day }}
              </button>
              <div
                v-else
                aria-hidden="true"
                class="flex h-6 w-full items-center justify-center rounded-sm text-xs text-muted-foreground/30"
              />
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
