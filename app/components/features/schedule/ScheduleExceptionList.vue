<script setup lang="ts">
import type { ScheduleException } from '~/types/api'
import { CalendarDays, CalendarRange, Trash2 } from 'lucide-vue-next'

defineProps<{
  exceptions: ScheduleException[]
}>()

const emit = defineEmits<{
  delete: [id: string]
  select: [exception: ScheduleException]
}>()

const { t } = useI18n()

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
})

function formatDate(dateStr: string): string {
  return dateFormatter.format(new Date(dateStr + 'T00:00:00'))
}

function formatShortDate(dateStr: string): string {
  return shortDateFormatter.format(new Date(dateStr + 'T00:00:00'))
}

function getDayCount(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

function isSameDay(start: string, end: string): boolean {
  return start === end
}
</script>

<template>
  <div>
    <div v-if="exceptions.length === 0" class="py-8 text-center text-muted-foreground">
      <CalendarDays class="mx-auto mb-2 h-8 w-8 opacity-50" />
      <p>{{ t('schedule.exceptions.empty') }}</p>
      <p class="mt-1 text-sm">{{ t('schedule.exceptions.emptyHint') }}</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="exception in exceptions"
        :key="exception.id"
        class="flex items-center gap-3 rounded-lg border bg-card p-3"
      >
        <div
          :class="[
            'h-2 w-2 shrink-0 rounded-full',
            exception.type === 'vacation' ? 'bg-emerald-500' : 'bg-rose-500',
          ]"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <Badge
              :variant="exception.type === 'vacation' ? 'secondary' : 'outline'"
              class="shrink-0 text-xs"
            >
              {{
                exception.type === 'vacation'
                  ? t('schedule.exceptions.vacation')
                  : t('schedule.exceptions.publicHoliday')
              }}
            </Badge>
            <span class="text-xs text-muted-foreground">
              {{
                t(
                  'schedule.exceptions.dayCount',
                  getDayCount(exception.start_date, exception.end_date),
                )
              }}
            </span>
          </div>
          <p class="mt-1 text-sm">
            <template v-if="isSameDay(exception.start_date, exception.end_date)">
              {{ formatDate(exception.start_date) }}
            </template>
            <template v-else>
              {{ formatShortDate(exception.start_date) }} — {{ formatDate(exception.end_date) }}
            </template>
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
            @click="emit('select', exception)"
          >
            <CalendarRange class="h-4 w-4" />
            <span class="sr-only">{{ t('schedule.exceptions.selectRange') }}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 cursor-pointer text-muted-foreground hover:text-destructive"
            @click="emit('delete', exception.id)"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
