import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HistoryTimelineSection from '../HistoryTimelineSection.vue'

const translations: Record<string, string | ((params?: Record<string, string>) => string)> = {
  'studentProfile.historyTitle': 'Historique',
  'studentProfile.empty.history': "Aucun événement dans l'historique.",
  'punishments.autoByRule': (params) => `Auto par ${params?.name ?? ''}`,
  'punishments.deletedRule': 'Règle supprimée',
  'punishments.pending': 'En attente',
  'punishments.resolved': 'Résolu',
  'common.dueAt': (params) => `Échéance : ${params?.date ?? ''}`,
  'punishments.resolvedAt': (params) => `Résolu le ${params?.date ?? ''}`,
  'studentProfile.history.punishment': (params) => `Punition : ${params?.name ?? ''}`,
  'studentProfile.history.bonus': (params) => `Bonus : ${params?.name ?? ''}`,
  'studentProfile.history.penalty': (params) => `Pénalité : ${params?.name ?? ''}`,
  'common.used': 'Consommé',
  'common.available': 'Disponible',
  'bonuses.usedAt': (params) => `Consommé le ${params?.date ?? ''}`,
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
  SectionHeaderPagination: {
    template: '<div />',
  },
  Badge: {
    template: '<span><slot /></span>',
  },
  NuxtLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
}

describe('HistoryTimelineSection', () => {
  it('shows automated origin first with a link when rule information is available', () => {
    const wrapper = mount(HistoryTimelineSection, {
      props: {
        history: [
          {
            type: 'punishment',
            id: 'p-1',
            punishment_type_id: 'type-1',
            punishment_type_name: 'Retenue',
            automated: true,
            triggering_rule_id: 'rule-1',
            triggering_rule_name: '3 retards = retenue',
            due_at: null,
            resolved_at: null,
            created_at: '2026-03-04T10:00:00.000Z',
          },
        ],
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Auto par 3 retards = retenue')
    expect(wrapper.text()).toContain('Punition : Retenue')
    expect(wrapper.findAll('a[href="/rules?ruleId=rule-1"]').length).toBeGreaterThan(0)
  })

  it('shows deleted-rule fallback when automated rule metadata is unavailable', () => {
    const wrapper = mount(HistoryTimelineSection, {
      props: {
        history: [
          {
            type: 'punishment',
            id: 'p-2',
            punishment_type_id: 'type-1',
            punishment_type_name: 'Retenue',
            automated: true,
            triggering_rule_id: null,
            triggering_rule_name: null,
            due_at: null,
            resolved_at: null,
            created_at: '2026-03-04T10:00:00.000Z',
          },
        ],
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Règle supprimée')
  })

  it('does not render the manual punishment label in history for manual punishments', () => {
    const wrapper = mount(HistoryTimelineSection, {
      props: {
        history: [
          {
            type: 'punishment',
            id: 'p-3',
            punishment_type_id: 'type-2',
            punishment_type_name: 'Excuses écrites',
            automated: false,
            due_at: null,
            resolved_at: null,
            created_at: '2026-03-04T10:00:00.000Z',
          },
        ],
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Punition : Excuses écrites')
    expect(wrapper.text()).not.toContain('Punition manuelle')
  })
})
