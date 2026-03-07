import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RuleCard from '../RuleCard.vue'

function readCount(params?: number | Record<string, number>) {
  if (typeof params === 'number') return params
  return params?.count ?? 0
}

const translations: Record<
  string,
  string | ((params?: number | Record<string, number>) => string)
> = {
  'rules.modes.at': 'Au seuil exact',
  'rules.threshold': (params) => `Seuil : ${readCount(params)}`,
  'rules.dueAfterDays': (params) => `Délai : ${readCount(params)} jours`,
  'rules.dueAfterLessons': (params) => `Échéance : après ${readCount(params)} cours`,
  'common.actions.edit': 'Modifier',
  'common.actions.delete': 'Supprimer',
}

const mockI18n = {
  t: (key: string, params?: number | Record<string, number>) => {
    const value = translations[key]
    if (typeof value === 'function') return value(params)
    return value ?? key
  },
  te: () => true,
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

const stubs = {
  Switch: {
    props: ['modelValue'],
    template: '<input type="checkbox" :checked="modelValue" />',
  },
  Badge: {
    template: '<span><slot /></span>',
  },
  Button: {
    template: '<button><slot /></button>',
  },
}

describe('RuleCard', () => {
  it('renders rule name as the primary title and keeps from->to as secondary metadata', () => {
    const wrapper = mount(RuleCard, {
      props: {
        name: 'Tolérance bavardage',
        penaltyTypeName: 'Bavardage',
        punishmentTypeName: 'Retenue',
        threshold: 3,
        dueAtMode: 'days',
        dueAtAfterDays: 7,
        dueAtAfterLessons: null,
        mode: 'at',
        isActive: true,
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.find('p.text-sm.font-semibold').text()).toBe('Tolérance bavardage')
    expect(wrapper.text()).toContain('Bavardage')
    expect(wrapper.text()).toContain('Retenue')
    expect(wrapper.text()).toContain('Seuil : 3')
  })

  it('renders the next_lessons due label when configured', () => {
    const wrapper = mount(RuleCard, {
      props: {
        name: 'Bavardage surveillé',
        penaltyTypeName: 'Bavardage',
        punishmentTypeName: 'Retenue',
        threshold: 2,
        dueAtMode: 'next_lessons',
        dueAtAfterDays: null,
        dueAtAfterLessons: 2,
        mode: 'at',
        isActive: true,
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Échéance : après 2 cours')
  })
})
