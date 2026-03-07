<script setup lang="ts">
import type { ScheduleException } from '~/types/api'
import { CalendarRange, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  exception: ScheduleException
}>()

const emit = defineEmits<{
  delete: [id: string]
  select: [exception: ScheduleException]
}>()

const { t } = useI18n()
const {
  formatExceptionDate,
  formatExceptionShortDate,
  getExceptionDayCount,
  isSingleDayException,
} = useScheduleExceptionFormatting()

const isSingleDay = computed(() =>
  isSingleDayException(props.exception.start_date, props.exception.end_date),
)

const dayCount = computed(() =>
  getExceptionDayCount(props.exception.start_date, props.exception.end_date),
)

const badgeVariant = computed(() => (props.exception.type === 'vacation' ? 'secondary' : 'outline'))

const typeLabel = computed(() =>
  props.exception.type === 'vacation'
    ? t('schedule.exceptions.vacation')
    : t('schedule.exceptions.publicHoliday'),
)

const dotClass = computed(() =>
  props.exception.type === 'vacation' ? 'bg-emerald-500' : 'bg-rose-500',
)

const startLabel = computed(() => {
  if (isSingleDay.value) {
    return formatExceptionDate(props.exception.start_date)
  }

  return formatExceptionShortDate(props.exception.start_date)
})

const endLabel = computed(() => formatExceptionDate(props.exception.end_date))
</script>

<template>
  <div class="flex items-center gap-3 rounded-lg border bg-card p-3" data-testid="schedule-exception-item">
    <div :class="['h-2 w-2 shrink-0 rounded-full', dotClass]" />

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <Badge :variant="badgeVariant" class="shrink-0 text-xs">
          {{ typeLabel }}
        </Badge>
        <span class="text-xs text-muted-foreground">
          {{ t('schedule.exceptions.dayCount', dayCount) }}
        </span>
      </div>

      <p class="mt-1 text-sm">
        <template v-if="isSingleDay">
          {{ startLabel }}
        </template>
        <template v-else>
          {{ startLabel }} — {{ endLabel }}
        </template>
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
        @click="emit('select', props.exception)"
      >
        <CalendarRange class="h-4 w-4" />
        <span class="sr-only">{{ t('schedule.exceptions.selectRange') }}</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive"
        @click="emit('delete', props.exception.id)"
      >
        <Trash2 class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>
