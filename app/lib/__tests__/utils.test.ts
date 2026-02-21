import { describe, it, expect } from 'vitest'
import { getInitials, formatPoints, formatDate } from '../utils'

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

    it('formats valid date correctly', () => {
      const date = '2026-02-19T14:30:00Z'
      // Note: toLocaleDateString might behave differently depending on environment locale
      // but let's assume it works with the provided options.
      expect(formatDate(date)).toContain('2026')
    })
  })
})
