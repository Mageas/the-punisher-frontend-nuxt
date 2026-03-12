import { parseDate, resetLocalTimeZone, setLocalTimeZone } from '@internationalized/date'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toTimeInputValue } from '~/lib/date-time'
import { useEditableOccurredAt } from '../useEditableOccurredAt'

describe('useEditableOccurredAt', () => {
  beforeEach(() => {
    setLocalTimeZone('Europe/Paris')
  })

  afterEach(() => {
    resetLocalTimeZone()
  })

  it('builds initial field values from the initial api datetime and serializes untouched values', () => {
    const initialOccurredAt = '2026-03-05T09:30:37.250Z'
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

    expect(serialized).toBe('2026-03-20T14:25:37.250+01:00')
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
