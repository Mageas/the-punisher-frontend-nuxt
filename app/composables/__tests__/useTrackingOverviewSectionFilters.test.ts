import { describe, expect, it } from 'vitest'
import {
  mapBonusApiFiltersToSectionFilter,
  mapBonusSectionFilterToApiFilters,
  mapPunishmentApiFiltersToSectionFilter,
  mapPunishmentSectionFilterToApiFilters,
} from '../useTrackingOverviewSectionFilters'

describe('useTrackingOverviewSectionFilters', () => {
  it('maps bonus section filters to API filters', () => {
    expect(mapBonusSectionFilterToApiFilters('available')).toEqual({ state: 'unused' })
    expect(mapBonusSectionFilterToApiFilters('used')).toEqual({ state: 'used' })
    expect(mapBonusSectionFilterToApiFilters('all')).toEqual({ state: undefined })
  })

  it('maps bonus API filters back to section filters', () => {
    expect(mapBonusApiFiltersToSectionFilter({ state: 'unused' })).toBe('available')
    expect(mapBonusApiFiltersToSectionFilter({ state: 'used' })).toBe('used')
    expect(mapBonusApiFiltersToSectionFilter({ state: undefined })).toBe('all')
  })

  it('maps punishment section filters to API filters', () => {
    expect(mapPunishmentSectionFilterToApiFilters('pending')).toEqual({
      state: 'pending',
      overdue: undefined,
    })
    expect(mapPunishmentSectionFilterToApiFilters('overdue')).toEqual({
      state: 'pending',
      overdue: 'true',
    })
    expect(mapPunishmentSectionFilterToApiFilters('resolved')).toEqual({
      state: 'resolved',
      overdue: undefined,
    })
    expect(mapPunishmentSectionFilterToApiFilters('all')).toEqual({
      state: undefined,
      overdue: undefined,
    })
  })

  it('maps punishment API filters back to section filters', () => {
    expect(mapPunishmentApiFiltersToSectionFilter({ state: 'pending' })).toBe('pending')
    expect(mapPunishmentApiFiltersToSectionFilter({ state: 'pending', overdue: 'true' })).toBe(
      'overdue',
    )
    expect(mapPunishmentApiFiltersToSectionFilter({ state: 'resolved' })).toBe('resolved')
    expect(mapPunishmentApiFiltersToSectionFilter({ state: undefined })).toBe('all')
  })
})
