import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import HistoryAvailableBonusesSection from '../HistoryAvailableBonusesSection.vue'

const AvailableBonusesSectionStub = defineComponent({
  name: 'AvailableBonusesSection',
  props: [
    'bonuses',
    'title',
    'emptyLabel',
    'badgeText',
    'badgeHelpText',
    'useFn',
    'page',
    'totalPages',
    'loading',
    'disabled',
  ],
  emits: ['used', 'update:page'],
  template: '<div data-testid="available-bonuses-section" />',
})

describe('HistoryAvailableBonusesSection', () => {
  it('forwards all adapter props and re-emits child events', async () => {
    const useFn = vi.fn()
    const wrapper = mount(HistoryAvailableBonusesSection, {
      props: {
        bonuses: [
          {
            id: 'bonus-1',
            bonus_type_name: 'Participation',
            points: 2,
            created_at: '2026-03-08T10:00:00Z',
          },
        ],
        title: 'Bonus disponibles',
        emptyLabel: 'Aucun bonus',
        badgeText: '2 / 5',
        badgeHelpText: 'Aide bonus',
        useFn,
        page: 1,
        totalPages: 3,
        loading: false,
        disabled: true,
      },
      global: {
        stubs: {
          AvailableBonusesSection: AvailableBonusesSectionStub,
        },
      },
    })

    const section = wrapper.getComponent(AvailableBonusesSectionStub)

    expect(section.props()).toMatchObject({
      bonuses: [
        {
          id: 'bonus-1',
          bonus_type_name: 'Participation',
          points: 2,
          created_at: '2026-03-08T10:00:00Z',
        },
      ],
      title: 'Bonus disponibles',
      emptyLabel: 'Aucun bonus',
      badgeText: '2 / 5',
      badgeHelpText: 'Aide bonus',
      useFn,
      page: 1,
      totalPages: 3,
      loading: false,
      disabled: true,
    })

    section.vm.$emit('used')
    section.vm.$emit('update:page', 2)

    expect(wrapper.emitted('used')).toEqual([[]])
    expect(wrapper.emitted('update:page')).toEqual([[2]])
  })
})
