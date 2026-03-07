import { getLocalTimeZone, parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { parseApiDateTime, serializeEditableDateTime, toTimeInputValue } from '~/lib/date-time'

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
    const parsed = parseApiDateTime(dateTime)
    if (!parsed) return undefined

    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')
    return parseDate(`${year}-${month}-${day}`)
  }

  function getInitialOccurredAtFieldValues(): EditableOccurredAtFieldValues {
    const initialOccurredAt = options.getInitialOccurredAt()

    return {
      occurred_at: toDateValue(initialOccurredAt),
      occurred_at_time: toTimeInputValue(initialOccurredAt),
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

  function handleOccurredAtTimeChange(
    value: string,
    setOccurredAtTime: (value: string) => void,
  ) {
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
      timeZone: getLocalTimeZone(),
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
