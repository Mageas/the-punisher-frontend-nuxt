import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatTime, getInitials, formatPoints, isUuid } from '../utils'

describe('utils.ts', () => {
  describe('getInitials', () => {
    it('returns initials for first and last name', () => {
      expect(getInitials('John', 'Doe')).toBe('JD')
    })

    it('returns empty string when no names are provided', () => {
      expect(getInitials()).toBe('')
    })

    it('returns single initial if only one name is provided', () => {
      expect(getInitials('John', null)).toBe('J')
      expect(getInitials(null, 'Doe')).toBe('D')
    })

    it('ignores leading and trailing spaces before extracting initials', () => {
      expect(getInitials('  John  ', '  Doe  ')).toBe('JD')
    })
  })

  describe('formatPoints', () => {
    it('formats points with pt suffix for single point', () => {
      expect(formatPoints(1)).toBe('1 pt')
    })

    it('formats points with pts suffix for multiple points', () => {
      expect(formatPoints(5)).toBe('5 pts')
    })

    it('formats points with pt suffix for 0', () => {
      expect(formatPoints(0)).toBe('0 pt')
    })
  })

  describe('formatDate', () => {
    it('returns empty string for null date', () => {
      expect(formatDate(null)).toBe('')
    })

    it('returns empty string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('')
    })

    it('formats valid date correctly', () => {
      const date = '2026-02-19T14:30:00Z'
      expect(formatDate(date, 'Europe/Paris')).toContain('2026')
    })

    it('uses the provided time zone for RFC3339 values', () => {
      expect(formatDate('2026-03-15T23:30:00Z', 'Europe/Paris')).toContain('16')
    })
  })

  describe('formatTime', () => {
    it('uses the provided time zone for RFC3339 values', () => {
      expect(formatTime('2026-03-15T17:45:00Z', 'Europe/Paris')).toBe('18:45')
    })
  })

  describe('formatDateTime', () => {
    it('includes both date and time in the requested time zone', () => {
      const formatted = formatDateTime('2026-03-15T17:45:00Z', 'Europe/Paris')
      expect(formatted).toContain('2026')
      expect(formatted).toContain('18:45')
    })
  })

  describe('isUuid', () => {
    it('accepts canonical UUID strings', () => {
      expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
    })

    it('rejects non-canonical 36-character strings', () => {
      expect(isUuid('------------------------------------')).toBe(false)
      expect(isUuid('550e8400e29b41d4a716446655440000')).toBe(false)
    })
  })
})
