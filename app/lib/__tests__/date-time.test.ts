import { parseDate, resetLocalTimeZone, setLocalTimeZone } from '@internationalized/date'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  applyTimeInputToDate,
  normalizeApiDateTimeFields,
  parseApiDateTime,
  serializeEditableDateTime,
  serializeDateValueWithTime,
  toApiDateTimeString,
  toTimeInputValue,
} from '../date-time'

describe('date-time.ts', () => {
  const parisTimeZone = 'Europe/Paris'

  beforeEach(() => {
    setLocalTimeZone(parisTimeZone)
  })

  afterEach(() => {
    resetLocalTimeZone()
  })

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
    it('serializes Date values with the requested time zone offset', () => {
      const date = new Date('2026-03-15T17:00:00Z')
      expect(toApiDateTimeString(date, parisTimeZone)).toBe('2026-03-15T18:00:00.000+01:00')
    })

    it('uses the actual daylight-saving offset for the target date', () => {
      const date = new Date('2026-06-20T12:25:37.250Z')
      expect(toApiDateTimeString(date, parisTimeZone)).toBe('2026-06-20T14:25:37.250+02:00')
    })
  })

  describe('toTimeInputValue', () => {
    it('formats API datetimes as HH:mm in the requested time zone and hides seconds', () => {
      expect(toTimeInputValue('2026-03-15T17:45:37.250Z', '08:00', parisTimeZone)).toBe('18:45')
    })

    it('falls back to the provided default when the datetime is invalid', () => {
      expect(toTimeInputValue('invalid-datetime', '09:30')).toBe('09:30')
    })
  })

  describe('applyTimeInputToDate', () => {
    it('defaults hidden seconds to zero for new datetimes in the requested time zone', () => {
      const date = parseDate('2026-03-20').toDate(parisTimeZone)

      applyTimeInputToDate(date, '14:25', { timeZone: parisTimeZone })

      expect(date.toISOString()).toBe('2026-03-20T13:25:00.000Z')
    })

    it('preserves sub-minute precision from the API during edition', () => {
      const date = parseDate('2026-03-20').toDate(parisTimeZone)
      const originalDateTime = '2026-03-15T08:10:37.250Z'

      applyTimeInputToDate(date, '14:25', {
        preserveSubMinuteFrom: originalDateTime,
        timeZone: parisTimeZone,
      })

      expect(date.toISOString()).toBe('2026-03-20T13:25:37.250Z')
    })
  })

  describe('serializeEditableDateTime', () => {
    it('preserves API-provided seconds when the field was not touched', () => {
      const originalDateTime = '2026-03-15T08:10:37.250Z'

      const serialized = serializeEditableDateTime({
        dateValue: parseDate('2026-03-20'),
        timeValue: '14:25',
        timeZone: parisTimeZone,
        touched: false,
        initialApiValue: originalDateTime,
      })

      expect(serialized).toBe('2026-03-20T14:25:37.250+01:00')
    })

    it('resets hidden seconds when the field was touched', () => {
      const originalDateTime = '2026-03-15T08:10:37.250Z'

      const serialized = serializeEditableDateTime({
        dateValue: parseDate('2026-03-20'),
        timeValue: '14:25',
        timeZone: parisTimeZone,
        touched: true,
        initialApiValue: originalDateTime,
      })

      expect(serialized).toBe('2026-03-20T14:25:00.000+01:00')
    })
  })

  describe('serializeDateValueWithTime', () => {
    it('serializes date values with the requested time zone offset', () => {
      const serialized = serializeDateValueWithTime({
        dateValue: parseDate('2026-03-20'),
        timeValue: '14:25',
        timeZone: parisTimeZone,
      })

      expect(serialized).toBe('2026-03-20T14:25:00.000+01:00')
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

    it('can serialize request payloads with the user time zone offset', () => {
      const body = {
        due_at: '2026-03-20T07:15:00Z',
        occurred_at: new Date('2026-06-20T12:25:37.250Z'),
      }

      const normalized = normalizeApiDateTimeFields(body, { timeZone: parisTimeZone })

      expect(normalized.due_at).toBe('2026-03-20T08:15:00.000+01:00')
      expect(normalized.occurred_at).toBe('2026-06-20T14:25:37.250+02:00')
    })

    it('keeps invalid *_at strings untouched', () => {
      const payload = { created_at: 'invalid-datetime' }
      const normalized = normalizeApiDateTimeFields(payload)
      expect(normalized.created_at).toBe('invalid-datetime')
    })
  })
})
