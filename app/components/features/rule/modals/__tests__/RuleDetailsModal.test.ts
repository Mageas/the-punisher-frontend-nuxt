import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RuleDetailsModal from '../RuleDetailsModal.vue'

function readCount(params?: number | Record<string, number>) {
  if (typeof params === 'number') return params
  return params?.count ?? 0
}

const translations: Record<
  string,
  string | ((params?: number | Record<string, number>) => string)
> = {
  'common.titles.rules': "Règles d'automatisation",
  'common.loading': 'Chargement...',
  'common.actions.edit': 'Modifier',
  'common.labels.threshold': 'Seuil',
  'common.labels.dueAt': 'Échéance',
  'rules.threshold': (params) => `Seuil : ${readCount(params)}`,
  'rules.dueAfterDays': (params) => `Délai : ${readCount(params)} jours`,
  'rules.dueModes.days': 'Jours',
  'rules.modes.at': 'Au seuil exact',
  'rules.details.description':
    "Consultez la configuration complète de cette règle d'automatisation.",
  'rules.details.triggerFlow': 'Déclencheur vers conséquence',
  'rules.details.trigger': 'Déclencheur',
  'rules.details.consequence': 'Conséquence',
  'rules.details.createdAt': 'Créée le',
  'rules.details.updatedAt': 'Modifiée le',
  'rules.details.active': 'Active',
  'rules.details.inactive': 'Inactive',
  'rules.details.empty': 'Aucune règle sélectionnée.',
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

vi.mock('~/lib/utils', async () => {
  const actual = await vi.importActual<typeof import('~/lib/utils')>('~/lib/utils')

  return {
    ...actual,
    formatDateTime: (value: string | null | undefined) => `fmt:${value ?? ''}`,
  }
})

const stubs = {
  Dialog: {
    props: ['open'],
    template: '<div><slot /></div>',
  },
  DialogContent: {
    template: '<div><slot /></div>',
  },
  DialogHeader: {
    template: '<div><slot /></div>',
  },
  DialogTitle: {
    template: '<div><slot /></div>',
  },
  DialogDescription: {
    template: '<div><slot /></div>',
  },
  Badge: {
    props: ['variant'],
    template: '<span><slot /></span>',
  },
  Button: {
    emits: ['click'],
    template: '<button @click="$emit(`click`)"><slot /></button>',
  },
}

describe('RuleDetailsModal', () => {
  it('renders the full rule details and exposes the optional edit action', async () => {
    const wrapper = mount(RuleDetailsModal, {
      props: {
        open: true,
        showEditAction: true,
        rule: {
          id: '93f5f043-bbcc-4a62-a522-504d8a86ee46',
          name: '3 bavardages -> retenue',
          resulting_punishment_type_id: 'punishment-1',
          resulting_punishment_type_name: 'Retenue',
          penalty_type_id: 'penalty-1',
          penalty_type_name: 'Bavardage',
          threshold: 3,
          due_at_mode: 'days',
          due_at_after_days: 2,
          due_at_after_lessons: null,
          mode: 'at',
          is_active: true,
          created_at: '2026-03-10T08:00:00.000Z',
          updated_at: '2026-03-11T09:30:00.000Z',
        },
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('3 bavardages -> retenue')
    expect(wrapper.text()).toContain('Déclencheur vers conséquence')
    expect(wrapper.text()).toContain('Bavardage')
    expect(wrapper.text()).toContain('Retenue')
    expect(wrapper.text()).toContain('Seuil : 3')
    expect(wrapper.text()).toContain('Délai : 2 jours')
    expect(wrapper.text()).toContain('fmt:2026-03-10T08:00:00.000Z')
    expect(wrapper.text()).toContain('fmt:2026-03-11T09:30:00.000Z')

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('edit')).toHaveLength(1)
  })

  it('shows a loading state while the rule is being fetched', () => {
    const wrapper = mount(RuleDetailsModal, {
      props: {
        open: true,
        loading: true,
        rule: null,
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Chargement...')
  })
})
