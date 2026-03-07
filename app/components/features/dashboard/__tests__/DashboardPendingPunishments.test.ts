import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import DashboardPendingPunishments from '../DashboardPendingPunishments.vue'

const mockI18n = {
  t: (key: string) =>
    ({
      'common.titles.pendingPunishments': 'Punitions en attente',
      'common.empty.noPunishments': 'Aucune punition',
    })[key] ?? key,
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

const PendingPunishmentsSectionStub = defineComponent({
  name: 'PendingPunishmentsSection',
  props: [
    'punishments',
    'title',
    'emptyLabel',
    'showCount',
    'countOverride',
    'badgeText',
    'badgeHelpText',
    'compact',
    'resolveFn',
  ],
  emits: ['resolved'],
  template: '<div data-testid="dashboard-pending-punishments" />',
})

describe('DashboardPendingPunishments', () => {
  it('injects dashboard defaults and re-emits the resolved event', async () => {
    const resolveFn = vi.fn()
    const wrapper = mount(DashboardPendingPunishments, {
      props: {
        punishments: [
          {
            id: 'punishment-1',
            student_id: 'student-1',
            student_first_name: 'Jane',
            student_last_name: 'Doe',
            punishment_type_id: 'punishment-type-1',
            punishment_type_name: 'Retenue',
            automated: true,
            triggering_rule_id: 'rule-1',
            triggering_rule_name: 'Retard',
            created_at: '2026-03-08T10:00:00Z',
            due_at: '2026-03-10T08:00:00Z',
            resolved_at: null,
          },
        ],
        resolveFn,
        countOverride: 4,
        badgeText: '4 / 12',
        badgeHelpText: 'Aide punitions',
      },
      global: {
        stubs: {
          PendingPunishmentsSection: PendingPunishmentsSectionStub,
        },
      },
    })

    const section = wrapper.getComponent(PendingPunishmentsSectionStub)

    expect(section.props()).toMatchObject({
      punishments: [
        {
          id: 'punishment-1',
          student_id: 'student-1',
          student_first_name: 'Jane',
          student_last_name: 'Doe',
          punishment_type_id: 'punishment-type-1',
          punishment_type_name: 'Retenue',
          automated: true,
          triggering_rule_id: 'rule-1',
          triggering_rule_name: 'Retard',
          created_at: '2026-03-08T10:00:00Z',
          due_at: '2026-03-10T08:00:00Z',
          resolved_at: null,
        },
      ],
      title: 'Punitions en attente',
      emptyLabel: 'Aucune punition',
      showCount: true,
      countOverride: 4,
      badgeText: '4 / 12',
      badgeHelpText: 'Aide punitions',
      compact: true,
      resolveFn,
    })

    section.vm.$emit('resolved')

    expect(wrapper.emitted('resolved')).toEqual([[]])
  })
})
