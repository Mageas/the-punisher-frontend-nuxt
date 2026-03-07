import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ClassroomProfileKpiCards from '../ClassroomProfileKpiCards.vue'

const translations: Record<string, string | ((count?: number) => string)> = {
  'common.titles.students': 'Eleves',
  'common.kpis.availableBonusPoints': 'Bonus disponibles',
  'common.titles.penalties': 'Penalites',
  'common.titles.pendingPunishments': 'Punitions en attente',
  'common.inSelection': 'Dans la selection',
  'common.unusedBonus': (count) => `${count} bonus inutilises`,
  'common.currentPeriod': 'Periode en cours',
  'common.overduePunishments': (count) => `${count} en retard`,
}

const mockI18n = {
  t: (key: string, count?: number) => {
    const value = translations[key]
    if (typeof value === 'function') return value(count)
    return value ?? key
  },
  te: () => true,
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

describe('ClassroomProfileKpiCards', () => {
  it('renders the four KPI cards through shared card components', () => {
    const wrapper = mount(ClassroomProfileKpiCards, {
      props: {
        kpis: {
          student_count: 18,
          available_bonus_points: 9,
          total_bonus_points: 14,
          unused_bonus_count: 3,
          penalty_count: 6,
          total_punishment_count: 8,
          overdue_punishment_count: 2,
          pending_punishment_count: 5,
        },
      },
    })

    expect(wrapper.text()).toContain('Eleves')
    expect(wrapper.text()).toContain('18')
    expect(wrapper.text()).toContain('Bonus disponibles')
    expect(wrapper.text()).toContain('9 / 14')
    expect(wrapper.text()).toContain('3 bonus inutilises')
    expect(wrapper.text()).toContain('Punitions en attente')
    expect(wrapper.text()).toContain('5 / 8')
    expect(wrapper.text()).toContain('2 en retard')
  })
})
