import type { WeekPattern, Weekday } from '~/types/api'

export interface ScheduleSlotFormValues {
  weekday: Weekday | ''
  start_time: string
  end_time: string
  week_pattern: WeekPattern
  classroom_ids: string[]
}

type TranslateFn = (key: string, params?: Record<string, unknown>) => string

export function getScheduleSlotFormErrors(
  form: ScheduleSlotFormValues,
  t: TranslateFn,
): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!form.weekday) {
    errors.weekday = t('apiErrors.details.validation_field_required')
  }

  if (!form.start_time) {
    errors.start_time = t('apiErrors.details.validation_field_required')
  }

  if (!form.end_time) {
    errors.end_time = t('apiErrors.details.validation_field_required')
  } else if (form.start_time && form.start_time >= form.end_time) {
    errors.end_time = t('schedule.form.endTimeAfterStart')
  }

  if (form.classroom_ids.length === 0) {
    errors.classroom_ids = t('apiErrors.details.validation_field_required')
  }

  return errors
}
