import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { describe, it, expect } from 'vitest'
import {
  applyTimeInputToDate,
  normalizeApiDateTimeFields,
  parseApiDateTime,
  serializeEditableDateTime,
  toApiDateTimeString,
  toTimeInputValue,
} from '../date-time'

describe('date-time.ts', () => {
  describe('parseApiDateTime', () => {
    it('parses a valid RFC3339 datetime', () => {
      const parsed = parseApiDateTime('2026-03-05T10:30:00Z')
      expect(parsed?.toISOString()).toBe('2026-03-05T10:30:00.000Z')
    })

    it('returns null for empty or invalid values', () => {
      expect(parseApiDateTime('')).toBeNull()
      expect(parseApiDateTime('not-a-date')).toBeNull()
      expect(parseApiDateTime(null)).toBeNull()
      expect(parseApiDateTime(undefined)).toBeNull()
    })
  })

  describe('toApiDateTimeString', () => {
    it('serializes Date values to RFC3339 UTC', () => {
      const date = new Date('2026-03-15T18:00:00Z')
      expect(toApiDateTimeString(date)).toBe('2026-03-15T18:00:00.000Z')
    })
  })

  describe('toTimeInputValue', () => {
    it('formats API datetimes as HH:mm and hides seconds', () => {
      const date = new Date(2026, 2, 15, 18, 45, 37, 250)
      expect(toTimeInputValue(date.toISOString())).toBe('18:45')
    })

    it('falls back to the provided default when the datetime is invalid', () => {
      expect(toTimeInputValue('invalid-datetime', '09:30')).toBe('09:30')
    })
  })

  describe('applyTimeInputToDate', () => {
    it('defaults hidden seconds to zero for new datetimes', () => {
      const date = new Date(2026, 2, 20, 0, 0, 12, 250)

      applyTimeInputToDate(date, '14:25')

      expect(date.getHours()).toBe(14)
      expect(date.getMinutes()).toBe(25)
      expect(date.getSeconds()).toBe(0)
      expect(date.getMilliseconds()).toBe(0)
    })

    it('preserves sub-minute precision from the API during edition', () => {
      const date = new Date(2026, 2, 20, 0, 0, 0, 0)
      const originalDateTime = new Date(2026, 2, 15, 9, 10, 37, 250)

      applyTimeInputToDate(date, '14:25', {
        preserveSubMinuteFrom: originalDateTime.toISOString(),
      })

      expect(date.getHours()).toBe(14)
      expect(date.getMinutes()).toBe(25)
      expect(date.getSeconds()).toBe(37)
      expect(date.getMilliseconds()).toBe(250)
    })
  })

  describe('serializeEditableDateTime', () => {
    it('preserves API-provided seconds when the field was not touched', () => {
      const originalDateTime = new Date(2026, 2, 15, 9, 10, 37, 250)

      const serialized = serializeEditableDateTime({
        dateValue: parseDate('2026-03-20'),
        timeValue: '14:25',
        timeZone: getLocalTimeZone(),
        touched: false,
        initialApiValue: originalDateTime.toISOString(),
      })

      const parsed = parseApiDateTime(serialized)

      expect(parsed?.getHours()).toBe(14)
      expect(parsed?.getMinutes()).toBe(25)
      expect(parsed?.getSeconds()).toBe(37)
      expect(parsed?.getMilliseconds()).toBe(250)
    })

    it('resets hidden seconds when the field was touched', () => {
      const originalDateTime = new Date(2026, 2, 15, 9, 10, 37, 250)

      const serialized = serializeEditableDateTime({
        dateValue: parseDate('2026-03-20'),
        timeValue: '14:25',
        timeZone: getLocalTimeZone(),
        touched: true,
        initialApiValue: originalDateTime.toISOString(),
      })

      const parsed = parseApiDateTime(serialized)

      expect(parsed?.getHours()).toBe(14)
      expect(parsed?.getMinutes()).toBe(25)
      expect(parsed?.getSeconds()).toBe(0)
      expect(parsed?.getMilliseconds()).toBe(0)
    })
  })

  describe('normalizeApiDateTimeFields', () => {
    it('normalizes nested *_at fields and keeps date-only filters unchanged', () => {
      const payload = {
        created_from: '2026-03-01',
        due_to: '2026-03-31',
        data: [
          {
            created_at: '2026-03-05T10:00:00Z',
            used_at: null,
            student: {
              updated_at: '2026-03-05T12:00:00+02:00',
            },
          },
        ],
      }

      const normalized = normalizeApiDateTimeFields(payload)

      expect(normalized.created_from).toBe('2026-03-01')
      expect(normalized.due_to).toBe('2026-03-31')
      expect(normalized.data[0]?.created_at).toBe('2026-03-05T10:00:00.000Z')
      expect(normalized.data[0]?.student.updated_at).toBe('2026-03-05T10:00:00.000Z')
      expect(normalized.data[0]?.used_at).toBeNull()
    })

    it('converts Date objects in *_at fields to RFC3339 UTC', () => {
      const dueAt = new Date('2026-03-20T07:15:00Z')
      const body = {
        due_at: dueAt,
        created_from: '2026-03-01',
      }

      const normalized = normalizeApiDateTimeFields(body)

      expect(normalized.due_at).toBe('2026-03-20T07:15:00.000Z')
      expect(normalized.created_from).toBe('2026-03-01')
      expect(body.due_at).toBe(dueAt)
    })

    it('keeps invalid *_at strings untouched', () => {
      const payload = { created_at: 'invalid-datetime' }
      const normalized = normalizeApiDateTimeFields(payload)
      expect(normalized.created_at).toBe('invalid-datetime')
    })
  })
})
