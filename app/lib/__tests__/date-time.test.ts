import { describe, it, expect } from 'vitest'
import { normalizeApiDateTimeFields, parseApiDateTime, toApiDateTimeString } from '../date-time'

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
