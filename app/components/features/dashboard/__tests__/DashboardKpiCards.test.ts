import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardKpiCards from '../DashboardKpiCards.vue'

const translations: Record<string, string | ((count?: number) => string)> = {
  'common.titles.students': 'Eleves',
  'common.inSelection': 'Dans la selection',
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

describe('DashboardKpiCards', () => {
  it('renders the shared student KPI card', () => {
    const wrapper = mount(DashboardKpiCards, {
      props: {
        kpis: {
          student_count: 24,
          available_bonus_points: 12,
          total_bonus_points: 20,
          unused_bonus_count: 5,
          penalty_count: 7,
          total_punishment_count: 4,
          overdue_punishment_count: 1,
          pending_punishment_count: 2,
        },
      },
    })

    expect(wrapper.text()).toContain('Eleves')
    expect(wrapper.text()).toContain('24')
    expect(wrapper.text()).toContain('Dans la selection')
  })
})
