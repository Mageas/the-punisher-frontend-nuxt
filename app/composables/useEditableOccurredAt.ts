import { parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import {
  getUserTimeZone,
  parseApiDateTimeInTimeZone,
  serializeEditableDateTime,
  toTimeInputValue,
} from '~/lib/date-time'

interface EditableOccurredAtOptions {
  getInitialOccurredAt: () => string | null
}

interface EditableOccurredAtFieldValues {
  occurred_at: DateValue | undefined
  occurred_at_time: string
}

export function useEditableOccurredAt(options: EditableOccurredAtOptions) {
  const occurredAtTouched = ref(false)

  function toDateValue(dateTime: string | null | undefined): DateValue | undefined {
    const parsed = parseApiDateTimeInTimeZone(dateTime, getUserTimeZone())
    if (!parsed) return undefined

    return parseDate(
      `${String(parsed.year).padStart(4, '0')}-${String(parsed.month).padStart(2, '0')}-${String(parsed.day).padStart(2, '0')}`,
    )
  }

  function getInitialOccurredAtFieldValues(): EditableOccurredAtFieldValues {
    const initialOccurredAt = options.getInitialOccurredAt()

    return {
      occurred_at: toDateValue(initialOccurredAt),
      occurred_at_time: toTimeInputValue(initialOccurredAt, '08:00', getUserTimeZone()),
    }
  }

  function resetOccurredAtTouched() {
    occurredAtTouched.value = false
  }

  function handleOccurredAtDateChange(
    value: DateValue | undefined,
    handleChangeDate: (value: DateValue | undefined) => void,
  ) {
    occurredAtTouched.value = true
    handleChangeDate(value)
  }

  function handleOccurredAtTimeChange(value: string, setOccurredAtTime: (value: string) => void) {
    occurredAtTouched.value = true
    setOccurredAtTime(value)
  }

  function serializeOccurredAt(optionsForSerialize: {
    dateValue: DateValue | undefined
    timeValue: string | null | undefined
  }) {
    return serializeEditableDateTime({
      dateValue: optionsForSerialize.dateValue,
      timeValue: optionsForSerialize.timeValue,
      timeZone: getUserTimeZone(),
      touched: occurredAtTouched.value,
      initialApiValue: options.getInitialOccurredAt(),
    })
  }

  return {
    occurredAtTouched,
    getInitialOccurredAtFieldValues,
    resetOccurredAtTouched,
    handleOccurredAtDateChange,
    handleOccurredAtTimeChange,
    serializeOccurredAt,
  }
}
