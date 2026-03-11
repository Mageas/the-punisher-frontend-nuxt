import type { WeekPattern } from '~/types/api'

export interface ScheduleWeekPatternVisual {
  value: WeekPattern
  dotClass: string
}

export const SCHEDULE_WEEK_PATTERN_VISUALS: readonly ScheduleWeekPatternVisual[] = [
  { value: 'every_week', dotClass: 'bg-schedule-weekly' },
  { value: 'even_weeks', dotClass: 'bg-info' },
  { value: 'odd_weeks', dotClass: 'bg-warning' },
]
