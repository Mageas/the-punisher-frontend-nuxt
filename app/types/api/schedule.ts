export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type WeekPattern = 'every_week' | 'even_weeks' | 'odd_weeks'

export const SCHEDULE_WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const satisfies readonly Weekday[]

export interface ScheduleSlotClassroom {
  id: string
  name: string
}

export interface ScheduleSlot {
  id: string
  weekday: Weekday
  start_time: string
  end_time: string
  week_pattern: WeekPattern
  classrooms: ScheduleSlotClassroom[]
  created_at: string
  updated_at: string
}

export interface ScheduleSlotCreateData {
  weekday: Weekday
  start_time: string
  end_time: string
  week_pattern: WeekPattern
  classroom_ids: string[]
}

export interface ScheduleSlotUpdateData {
  weekday?: Weekday
  start_time?: string
  end_time?: string
  week_pattern?: WeekPattern
  classroom_ids?: string[]
}

export interface ScheduleException {
  id: string
  type: 'vacation' | 'public_holiday'
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export interface ScheduleExceptionCreateData {
  type: 'vacation' | 'public_holiday'
  start_date: string
  end_date: string
}

export interface ScheduleExceptionUpdateData {
  type?: 'vacation' | 'public_holiday'
  start_date?: string
  end_date?: string
}

export interface NextLesson {
  date: string
  start_time: string
  end_time: string
}
