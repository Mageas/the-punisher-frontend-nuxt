<script setup lang="ts">
import type { ScheduleSlot, Weekday } from '~/types/api'
import { cn } from '~/lib/utils'

const props = defineProps<{
  slots: ScheduleSlot[]
  weekdays: Weekday[]
  startHour: number
  endHour: number
  stepMinutes: number
}>()

const emit = defineEmits<{
  'click-slot': [slot: ScheduleSlot]
  'click-empty': [weekday: Weekday, startTime: string, endTime: string]
  'drag-create': [weekday: Weekday, startTime: string, endTime: string]
}>()

const { t } = useI18n()

// ---- Drag state ----
const isDragging = ref(false)
const dragDay = ref<Weekday | null>(null)
const dragStartStep = ref<number | null>(null)
const dragEndStep = ref<number | null>(null)
const dragDidMove = ref(false)
const suppressNextEmptyClick = ref(false)
let removeDocumentDragListeners: (() => void) | null = null

// Generate time labels (e.g. "08:00", "08:30", ...)
const timeLabels = computed(() => {
  const labels: string[] = []
  for (let h = props.startHour; h <= props.endHour; h++) {
    for (let m = 0; m < 60; m += props.stepMinutes) {
      if (h === props.endHour && m > 0) break
      labels.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return labels
})

// Total number of step rows
const totalSteps = computed(() => timeLabels.value.length - 1)

// Determine if a step falls on a 30-minute boundary (for visual styling)
function isHalfHourBoundary(stepIndex: number): boolean {
  const minutes = props.startHour * 60 + stepIndex * props.stepMinutes
  return minutes % 30 === 0
}

// Determine if a step falls on a full-hour boundary (for labels)
function isHourBoundary(stepIndex: number): boolean {
  const minutes = props.startHour * 60 + stepIndex * props.stepMinutes
  return minutes % 60 === 0
}

// Convert "HH:MM" to minutes since midnight
function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number)
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
}

// Convert minutes since midnight to step index (0-based)
function minutesToStep(minutes: number): number {
  const base = props.startHour * 60
  return (minutes - base) / props.stepMinutes
}

// Group slots by weekday
const slotsByDay = computed(() => {
  const map = new Map<Weekday, ScheduleSlot[]>()
  for (const day of props.weekdays) {
    map.set(day, [])
  }
  for (const slot of props.slots) {
    const daySlots = map.get(slot.weekday)
    if (daySlots) daySlots.push(slot)
  }
  return map
})

interface PositionedSlot {
  slot: ScheduleSlot
  top: number // as percentage of grid height
  height: number // as percentage of grid height
  left: number // as percentage of column width
  width: number // as percentage of column width
}

// Compute positioned slots with overlap handling per day
function getPositionedSlots(daySlots: ScheduleSlot[]): PositionedSlot[] {
  if (daySlots.length === 0) return []

  const sorted = [...daySlots].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time),
  )

  // Build overlap groups
  const groups: ScheduleSlot[][] = []
  let currentGroup: ScheduleSlot[] = []
  let currentGroupEnd = 0

  for (const slot of sorted) {
    const start = timeToMinutes(slot.start_time)
    const end = timeToMinutes(slot.end_time)

    if (currentGroup.length === 0 || start < currentGroupEnd) {
      currentGroup.push(slot)
      currentGroupEnd = Math.max(currentGroupEnd, end)
    } else {
      groups.push(currentGroup)
      currentGroup = [slot]
      currentGroupEnd = end
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup)

  const positioned: PositionedSlot[] = []

  for (const group of groups) {
    const count = group.length
    group.forEach((slot, index) => {
      const startStep = minutesToStep(timeToMinutes(slot.start_time))
      const endStep = minutesToStep(timeToMinutes(slot.end_time))

      positioned.push({
        slot,
        top: (startStep / totalSteps.value) * 100,
        height: ((endStep - startStep) / totalSteps.value) * 100,
        left: (index / count) * 100,
        width: (1 / count) * 100,
      })
    })
  }

  return positioned
}

const weekPatternColor: Record<string, string> = {
  every_week: 'bg-violet-500/15 border-violet-500/40 hover:bg-violet-500/25 text-foreground',
  even_weeks: 'bg-info/15 border-info/40 hover:bg-info/25 text-foreground',
  odd_weeks: 'bg-warning/15 border-warning/40 hover:bg-warning/25 text-foreground',
}

const weekPatternDot: Record<string, string> = {
  every_week: 'bg-violet-500',
  even_weeks: 'bg-info',
  odd_weeks: 'bg-warning',
}

function handleEmptyClick(weekday: Weekday, stepIndex: number) {
  if (suppressNextEmptyClick.value) {
    suppressNextEmptyClick.value = false
    return
  }

  emit('click-empty', weekday, stepToTime(stepIndex), stepToTime(stepIndex + 1))
}

function handleSlotClick(event: Event, slot: ScheduleSlot) {
  event.stopPropagation()
  if (!isDragging.value) {
    emit('click-slot', slot)
  }
}

// ---- Drag-to-create logic ----
function stepToTime(stepIndex: number): string {
  const minutes = props.startHour * 60 + stepIndex * props.stepMinutes
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function handleCellMouseDown(event: MouseEvent, weekday: Weekday, stepIndex: number) {
  // Only left click
  if (event.button !== 0) return
  event.preventDefault()
  cleanupDocumentDragListeners()
  suppressNextEmptyClick.value = false
  isDragging.value = true
  dragDay.value = weekday
  dragStartStep.value = stepIndex
  dragEndStep.value = stepIndex
  dragDidMove.value = false

  function onMouseMove(e: MouseEvent) {
    if (!isDragging.value) return

    // Find which cell we're hovering over by walking up from target
    const target = document.elementFromPoint(e.clientX, e.clientY)
    if (!target) return

    const cell = (target as HTMLElement).closest('[data-step]') as HTMLElement | null
    if (!cell) return

    const cellDay = cell.dataset.day as Weekday | undefined
    const cellStep = cell.dataset.step

    // Must stay in the same day column
    if (cellDay !== dragDay.value || cellStep === undefined) return

    const nextStep = parseInt(cellStep, 10)
    if (Number.isNaN(nextStep)) return

    if (dragStartStep.value !== null && nextStep !== dragStartStep.value) {
      dragDidMove.value = true
    }

    dragEndStep.value = nextStep
  }

  function onMouseUp() {
    cleanupDocumentDragListeners()

    if (
      isDragging.value &&
      dragDay.value !== null &&
      dragStartStep.value !== null &&
      dragEndStep.value !== null
    ) {
      if (dragDidMove.value) {
        const minStep = Math.min(dragStartStep.value, dragEndStep.value)
        const maxStep = Math.max(dragStartStep.value, dragEndStep.value) + 1

        suppressNextEmptyClick.value = true
        emit('drag-create', dragDay.value, stepToTime(minStep), stepToTime(maxStep))
      }
    }

    isDragging.value = false
    dragDay.value = null
    dragStartStep.value = null
    dragEndStep.value = null
    dragDidMove.value = false
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
  removeDocumentDragListeners = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
}

// Drag preview: which cells to highlight
function isDragHighlighted(weekday: Weekday, stepIndex: number): boolean {
  if (!isDragging.value || dragDay.value !== weekday) return false
  if (dragStartStep.value === null || dragEndStep.value === null) return false
  const minStep = Math.min(dragStartStep.value, dragEndStep.value)
  const maxStep = Math.max(dragStartStep.value, dragEndStep.value)
  return stepIndex >= minStep && stepIndex <= maxStep
}

function cleanupDocumentDragListeners() {
  removeDocumentDragListeners?.()
  removeDocumentDragListeners = null
}

onBeforeUnmount(() => {
  cleanupDocumentDragListeners()
})
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-border bg-card">
    <!-- Header row: corner + day names -->
    <div
      class="grid min-w-[700px] border-b border-border"
      :style="{ gridTemplateColumns: `64px repeat(${weekdays.length}, 1fr)` }"
    >
      <div class="border-r border-border bg-card p-2" />
      <div
        v-for="day in weekdays"
        :key="`header-${day}`"
        class="bg-card px-2 py-3 text-center text-sm font-semibold"
      >
        <span class="hidden md:inline">{{ t(`schedule.weekdays.${day}`) }}</span>
        <span class="md:hidden">{{ t(`schedule.weekdaysShort.${day}`) }}</span>
      </div>
    </div>

    <!-- Body: time gutter + day columns side by side -->
    <div
      class="grid min-w-[700px]"
      :style="{ gridTemplateColumns: `64px repeat(${weekdays.length}, 1fr)` }"
    >
      <!-- Time gutter -->
      <div class="border-r border-border">
        <div
          v-for="(time, stepIndex) in timeLabels.slice(0, -1)"
          :key="`time-${time}`"
          class="relative h-3.5 px-1.5 text-right text-[11px] font-medium text-muted-foreground"
          :class="[
            stepIndex < totalSteps - 1 && isHourBoundary(stepIndex + 1)
              ? 'border-b border-b-border'
              : stepIndex < totalSteps - 1 && isHalfHourBoundary(stepIndex + 1)
                ? 'border-b border-b-border/60'
                : stepIndex < totalSteps - 1
                  ? 'border-b border-dashed border-b-border/25'
                  : '',
          ]"
        >
          <span v-if="isHourBoundary(stepIndex)" class="absolute -top-2.5 right-1.5">{{
            time
          }}</span>
        </div>
      </div>

      <!-- Day columns — each is a relative container holding its slots -->
      <div
        v-for="(day, dayIndex) in weekdays"
        :key="`col-${day}`"
        class="relative"
        :class="dayIndex < weekdays.length - 1 ? 'border-r border-r-border/30' : ''"
      >
        <!-- Background grid lines (one div per step for hover + click + drag) -->
        <div
          v-for="(time, stepIndex) in timeLabels.slice(0, -1)"
          :key="`cell-${day}-${time}`"
          :data-day="day"
          :data-step="stepIndex"
          class="h-3.5 cursor-pointer border-border transition-colors"
          :class="[
            stepIndex < totalSteps - 1 && isHourBoundary(stepIndex + 1)
              ? 'border-b border-b-border'
              : stepIndex < totalSteps - 1 && isHalfHourBoundary(stepIndex + 1)
                ? 'border-b border-b-border/40'
                : stepIndex < totalSteps - 1
                  ? 'border-b border-dashed border-b-border/15'
                  : '',
            isDragHighlighted(day, stepIndex) ? 'bg-violet-500/20' : 'hover:bg-muted/40',
            isDragging ? 'select-none' : '',
          ]"
          @click="handleEmptyClick(day, stepIndex)"
          @mousedown="handleCellMouseDown($event, day, stepIndex)"
        />

        <!-- Positioned slot blocks (absolute over the column) -->
        <div
          v-for="pos in getPositionedSlots(slotsByDay.get(day) || [])"
          :key="pos.slot.id"
          :class="
            cn(
              'absolute z-10 cursor-pointer rounded-md border px-1.5 py-1 text-xs transition-all hover:shadow-md hover:z-20 focus:outline-none focus-visible:outline-none',
              weekPatternColor[pos.slot.week_pattern],
            )
          "
          :style="{
            top: `${pos.top}%`,
            height: `${pos.height}%`,
            left: `calc(${pos.left}% + 2px)`,
            width: `calc(${pos.width}% - 4px)`,
            minHeight: '1.5rem',
          }"
          tabindex="0"
          :title="`${pos.slot.start_time} - ${pos.slot.end_time}`"
          @click="handleSlotClick($event, pos.slot)"
          @keydown.enter="handleSlotClick($event, pos.slot)"
        >
          <div class="flex items-start gap-1 overflow-hidden">
            <span
              :class="
                cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', weekPatternDot[pos.slot.week_pattern])
              "
            />
            <div class="min-w-0 flex-1 overflow-hidden">
              <p class="truncate font-semibold leading-tight">
                {{
                  pos.slot.classrooms.length > 0
                    ? pos.slot.classrooms.map((c) => c.name).join(', ')
                    : t('schedule.noClassrooms')
                }}
              </p>
              <p class="truncate leading-tight text-muted-foreground">
                {{ pos.slot.start_time }} – {{ pos.slot.end_time }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
