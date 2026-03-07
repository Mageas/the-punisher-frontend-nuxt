import { describe, expect, it } from 'vitest'
import { parseDate } from '@internationalized/date'
import { useScheduleExceptionFormatting } from '../useScheduleExceptionFormatting'

describe('useScheduleExceptionFormatting', () => {
  it('shares the same long formatter for DateValue and API dates', () => {
    const formatting = useScheduleExceptionFormatting()

    expect(formatting.formatDateValue(parseDate('2026-03-07'))).toBe(
      formatting.formatExceptionDate('2026-03-07'),
    )
    expect(formatting.formatExceptionDate('2026-03-07')).toContain('2026')
  })

  it('computes day counts and detects single-day exceptions', () => {
    const formatting = useScheduleExceptionFormatting()

    expect(formatting.getExceptionDayCount('2026-03-07', '2026-03-09')).toBe(3)
    expect(formatting.isSingleDayException('2026-03-07', '2026-03-07')).toBe(true)
    expect(formatting.isSingleDayException('2026-03-07', '2026-03-09')).toBe(false)
  })
})
