import { describe, expect, it } from 'vitest'
import { getScheduleSlotFormErrors } from '../schedule-slot-form'

function t(key: string) {
  return key
}

describe('schedule-slot-form', () => {
  it('returns required errors only for missing fields', () => {
    expect(
      getScheduleSlotFormErrors(
        {
          weekday: '',
          start_time: '',
          end_time: '',
          week_pattern: 'every_week',
          classroom_ids: [],
        },
        t,
      ),
    ).toEqual({
      weekday: 'apiErrors.details.validation_field_required',
      start_time: 'apiErrors.details.validation_field_required',
      end_time: 'apiErrors.details.validation_field_required',
      classroom_ids: 'apiErrors.details.validation_field_required',
    })
  })

  it('rejects an end time earlier than the start time', () => {
    expect(
      getScheduleSlotFormErrors(
        {
          weekday: 'monday',
          start_time: '10:00',
          end_time: '09:30',
          week_pattern: 'every_week',
          classroom_ids: ['class-1'],
        },
        t,
      ),
    ).toEqual({
      end_time: 'schedule.form.endTimeAfterStart',
    })
  })
})
