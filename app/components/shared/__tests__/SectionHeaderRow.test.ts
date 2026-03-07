import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SectionHeaderRow from '../SectionHeaderRow.vue'

describe('SectionHeaderRow', () => {
  it('renders title, pagination and badge then proxies pagination updates', async () => {
    const wrapper = mount(SectionHeaderRow, {
      props: {
        title: 'Historique',
        page: 2,
        totalPages: 4,
        badgeText: '12',
        badgeHelpText: 'Aide',
        badgeClass: 'text-danger',
      },
      global: {
        stubs: {
          SectionHeaderPagination: {
            props: ['page', 'totalPages'],
            template:
              '<button data-testid="pagination" @click="$emit(\'update:page\', 3)">{{ page }}/{{ totalPages }}</button>',
          },
          KpiInfoBadge: {
            props: ['text', 'helpText', 'badgeClass'],
            template:
              '<span data-testid="badge" :data-help-text="helpText" :data-badge-class="badgeClass">{{ text }}</span>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Historique')
    expect(wrapper.get('[data-testid="pagination"]').text()).toBe('2/4')
    expect(wrapper.get('[data-testid="badge"]').text()).toBe('12')
    expect(wrapper.get('[data-testid="badge"]').attributes('data-help-text')).toBe('Aide')
    expect(wrapper.get('[data-testid="badge"]').attributes('data-badge-class')).toBe('text-danger')

    await wrapper.get('[data-testid="pagination"]').trigger('click')

    expect(wrapper.emitted('update:page')).toEqual([[3]])
  })

  it('can hide pagination and badge', () => {
    const wrapper = mount(SectionHeaderRow, {
      props: {
        title: 'Recents',
        showPagination: false,
      },
      global: {
        stubs: {
          SectionHeaderPagination: true,
          KpiInfoBadge: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Recents')
    expect(wrapper.findComponent({ name: 'SectionHeaderPagination' }).exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'KpiInfoBadge' }).exists()).toBe(false)
  })
})
