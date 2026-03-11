import type { SectionFilterOption } from '~/types/ui'

export const bonusSectionFilterValues = ['available', 'used', 'all'] as const
export type BonusSectionFilter = (typeof bonusSectionFilterValues)[number]

export const punishmentSectionFilterValues = ['pending', 'overdue', 'resolved', 'all'] as const
export type PunishmentSectionFilter = (typeof punishmentSectionFilterValues)[number]

export function mapBonusSectionFilterToApiFilters(filter: BonusSectionFilter): {
  state?: 'unused' | 'used'
} {
  switch (filter) {
    case 'available':
      return { state: 'unused' }
    case 'used':
      return { state: 'used' }
    default:
      return { state: undefined }
  }
}

export function mapBonusApiFiltersToSectionFilter(filters: {
  state?: string | null | undefined
}): BonusSectionFilter {
  switch (filters.state) {
    case 'unused':
      return 'available'
    case 'used':
      return 'used'
    default:
      return 'all'
  }
}

export function mapPunishmentSectionFilterToApiFilters(filter: PunishmentSectionFilter): {
  state?: 'pending' | 'resolved'
  overdue?: 'true'
} {
  switch (filter) {
    case 'pending':
      return { state: 'pending', overdue: undefined }
    case 'overdue':
      return { state: 'pending', overdue: 'true' }
    case 'resolved':
      return { state: 'resolved', overdue: undefined }
    default:
      return { state: undefined, overdue: undefined }
  }
}

export function mapPunishmentApiFiltersToSectionFilter(filters: {
  state?: string | null | undefined
  overdue?: string | null | undefined
}): PunishmentSectionFilter {
  if (filters.overdue === 'true') {
    return 'overdue'
  }

  switch (filters.state) {
    case 'pending':
      return 'pending'
    case 'resolved':
      return 'resolved'
    default:
      return 'all'
  }
}

export function useTrackingOverviewSectionFilters() {
  const { t } = useI18n()

  const bonusesFilterOptions = computed<SectionFilterOption[]>(() => [
    { label: t('common.filters.bonuses.all'), value: 'all' },
    { label: t('common.filters.bonuses.available'), value: 'available' },
    { label: t('common.filters.bonuses.used'), value: 'used' },
  ])

  const punishmentsFilterOptions = computed<SectionFilterOption[]>(() => [
    { label: t('common.filters.punishments.all'), value: 'all' },
    { label: t('common.filters.punishments.pending'), value: 'pending' },
    { label: t('common.filters.punishments.overdue'), value: 'overdue' },
    { label: t('common.filters.punishments.resolved'), value: 'resolved' },
  ])

  return {
    bonusesFilterOptions,
    punishmentsFilterOptions,
  }
}
