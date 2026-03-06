import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PunishmentCard from '../PunishmentCard.vue'

const translations: Record<string, string | ((params?: Record<string, string>) => string)> = {
  'punishments.autoByRule': (params) => `Auto par ${params?.name ?? ''}`,
  'punishments.deletedRule': 'Règle supprimée',
  'common.states.pending': 'En attente',
  'common.states.resolved': 'Résolu',
  'common.dueAt': (params) => `Échéance : ${params?.date ?? ''}`,
  'punishments.resolvedAt': (params) => `Résolu le ${params?.date ?? ''}`,
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
  Button: {
    template: '<button><slot /></button>',
  },
  NuxtLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
}

describe('PunishmentCard', () => {
  it('shows student name first and automated origin below for automated punishments', () => {
    const wrapper = mount(PunishmentCard, {
      props: {
        punishmentTypeName: 'Retenue',
        automated: true,
        triggeringRuleId: 'rule-1',
        triggeringRuleName: '3 retards = retenue',
        studentFirstName: 'Jean',
        studentLastName: 'Dupont',
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Jean Dupont')
    expect(wrapper.text()).toContain('Retenue')
    expect(wrapper.text()).toContain('Auto par 3 retards = retenue')
    expect(wrapper.findAll('a[href="/students/undefined"]').length).toBe(0)
    expect(wrapper.findAll('a[href="/rules?ruleId=rule-1"]').length).toBeGreaterThan(0)
  })

  it('shows deleted-rule fallback for automated punishments without a usable rule', () => {
    const wrapper = mount(PunishmentCard, {
      props: {
        punishmentTypeName: 'Retenue',
        automated: true,
        triggeringRuleId: null,
        triggeringRuleName: null,
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Règle supprimée')
  })

  it('does not render the manual punishment label for manual punishments', () => {
    const wrapper = mount(PunishmentCard, {
      props: {
        punishmentTypeName: 'Retenue',
        automated: false,
        studentFirstName: 'Lina',
        studentLastName: 'Martin',
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Lina Martin')
    expect(wrapper.text()).toContain('Retenue')
    expect(wrapper.text()).not.toContain('Punition manuelle')
  })
})
