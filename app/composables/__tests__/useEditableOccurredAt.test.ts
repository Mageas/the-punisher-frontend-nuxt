import { parseDate } from '@internationalized/date'
import { describe, expect, it, vi } from 'vitest'
import { parseApiDateTime, toTimeInputValue } from '~/lib/date-time'
import { useEditableOccurredAt } from '../useEditableOccurredAt'

describe('useEditableOccurredAt', () => {
  it('builds initial field values from the initial api datetime and serializes untouched values', () => {
    const initialOccurredAt = '2026-03-05T10:30:37.250Z'
    const editableOccurredAt = useEditableOccurredAt({
      getInitialOccurredAt: () => initialOccurredAt,
    })

    expect(editableOccurredAt.getInitialOccurredAtFieldValues()).toEqual({
      occurred_at: parseDate('2026-03-05'),
      occurred_at_time: toTimeInputValue(initialOccurredAt),
    })

    const serialized = editableOccurredAt.serializeOccurredAt({
      dateValue: parseDate('2026-03-20'),
      timeValue: '14:25',
    })
    const parsed = parseApiDateTime(serialized)

    expect(parsed?.getHours()).toBe(14)
    expect(parsed?.getMinutes()).toBe(25)
    expect(parsed?.getSeconds()).toBe(37)
    expect(parsed?.getMilliseconds()).toBe(250)
  })

  it('marks the field as touched when the date or time changes', () => {
    const editableOccurredAt = useEditableOccurredAt({
      getInitialOccurredAt: () => null,
    })
    const handleChangeDate = vi.fn()
    const setOccurredAtTime = vi.fn()
    const nextDate = parseDate('2026-03-20')

    editableOccurredAt.handleOccurredAtDateChange(nextDate, handleChangeDate)

    expect(editableOccurredAt.occurredAtTouched.value).toBe(true)
    expect(handleChangeDate).toHaveBeenCalledWith(nextDate)

    editableOccurredAt.resetOccurredAtTouched()
    editableOccurredAt.handleOccurredAtTimeChange('09:15', setOccurredAtTime)

    expect(editableOccurredAt.occurredAtTouched.value).toBe(true)
    expect(setOccurredAtTime).toHaveBeenCalledWith('09:15')
  })
})
