import { describe, expect, it } from 'vitest'
import { computeTotalPages, formatPunishmentsProgress, formatRatio } from '../kpi-formatters'

describe('kpi-formatters', () => {
  it('formats ratios consistently', () => {
    expect(formatRatio(3, 5)).toBe('3 / 5')
  })

  it('formats punishment progress with resolved count first', () => {
    expect(formatPunishmentsProgress(10, 4, 2)).toBe('6 / 10 (2)')
    expect(formatPunishmentsProgress(3, 7, 1)).toBe('0 / 3 (1)')
  })

  it('computes total pages with safe lower bounds', () => {
    expect(computeTotalPages(0, 10)).toBe(1)
    expect(computeTotalPages(21, 10)).toBe(3)
    expect(computeTotalPages(21, 0)).toBe(1)
  })
})
