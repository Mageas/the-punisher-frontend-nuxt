import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import HistoryPendingPunishmentsSection from '../HistoryPendingPunishmentsSection.vue'

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
    'page',
    'totalPages',
    'loading',
    'disabled',
  ],
  emits: ['resolved', 'update:page'],
  template: '<div data-testid="pending-punishments-section" />',
})

describe('HistoryPendingPunishmentsSection', () => {
  it('forwards all adapter props and re-emits child events', async () => {
    const resolveFn = vi.fn()
    const wrapper = mount(HistoryPendingPunishmentsSection, {
      props: {
        punishments: [
          {
            id: 'punishment-1',
            punishment_type_name: 'Retenue',
            automated: false,
          },
        ],
        title: 'Punitions en attente',
        emptyLabel: 'Aucune punition',
        showCount: true,
        countOverride: 3,
        badgeText: '3 / 10',
        badgeHelpText: 'Aide',
        compact: true,
        resolveFn,
        page: 2,
        totalPages: 4,
        loading: true,
        disabled: true,
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
          punishment_type_name: 'Retenue',
          automated: false,
        },
      ],
      title: 'Punitions en attente',
      emptyLabel: 'Aucune punition',
      showCount: true,
      countOverride: 3,
      badgeText: '3 / 10',
      badgeHelpText: 'Aide',
      compact: true,
      resolveFn,
      page: 2,
      totalPages: 4,
      loading: true,
      disabled: true,
    })

    section.vm.$emit('resolved')
    section.vm.$emit('update:page', 3)

    expect(wrapper.emitted('resolved')).toEqual([[]])
    expect(wrapper.emitted('update:page')).toEqual([[3]])
  })
})
