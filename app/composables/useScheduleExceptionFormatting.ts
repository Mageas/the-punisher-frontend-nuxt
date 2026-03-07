import type { DateValue } from '@internationalized/date'

const longDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
})

function toMidnightDate(value: string) {
  return new Date(`${value}T00:00:00`)
}

export function useScheduleExceptionFormatting() {
  function formatDateValue(date: DateValue): string {
    return longDateFormatter.format(toMidnightDate(date.toString()))
  }

  function formatExceptionDate(date: string): string {
    return longDateFormatter.format(toMidnightDate(date))
  }

  function formatExceptionShortDate(date: string): string {
    return shortDateFormatter.format(toMidnightDate(date))
  }

  function getExceptionDayCount(startDate: string, endDate: string): number {
    const start = toMidnightDate(startDate)
    const end = toMidnightDate(endDate)

    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  function isSingleDayException(startDate: string, endDate: string): boolean {
    return startDate === endDate
  }

  return {
    formatDateValue,
    formatExceptionDate,
    formatExceptionShortDate,
    getExceptionDayCount,
    isSingleDayException,
  }
}
