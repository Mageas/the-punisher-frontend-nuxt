import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BonusCard from '../BonusCard.vue'

const translations: Record<string, string | ((params?: Record<string, string>) => string)> = {
  'common.states.available': 'Disponible',
  'common.states.used': 'Utilise',
  'bonuses.usedAt': (params) => `Utilise le ${params?.date ?? ''}`,
}

const mockI18n = {
  t: (key: string, params?: Record<string, string>) => {
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
  Badge: {
    template: '<span><slot /></span>',
  },
  NuxtLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
}

describe('BonusCard', () => {
  it('shows student name first and keeps bonus metadata underneath', () => {
    const wrapper = mount(BonusCard, {
      props: {
        bonusTypeName: 'Participation',
        points: 2,
        occurredAt: '2026-03-05T10:00:00.000Z',
        studentId: 'student-1',
        studentFirstName: 'Jean',
        studentLastName: 'Dupont',
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Jean Dupont')
    expect(wrapper.text()).toContain('Participation')
    expect(wrapper.text()).toContain('Disponible')
    expect(wrapper.find('a[href="/students/student-1"]').exists()).toBe(true)
  })

  it('shows the used state details when the bonus has been consumed', () => {
    const wrapper = mount(BonusCard, {
      props: {
        bonusTypeName: 'Participation',
        points: 2,
        occurredAt: '2026-03-05T10:00:00.000Z',
        usedAt: '2026-03-08T12:00:00.000Z',
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Participation')
    expect(wrapper.text()).toContain('Utilise')
    expect(wrapper.text()).toContain('Utilise le')
  })
})
