import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SectionListBlock from '../SectionListBlock.vue'

describe('SectionListBlock', () => {
  it('renders the empty state when the list is empty', () => {
    const wrapper = mount(SectionListBlock, {
      props: {
        isEmpty: true,
        emptyLabel: 'Aucune donnee',
      },
    })

    expect(wrapper.get('[data-testid="section-empty-state"]').text()).toContain('Aucune donnee')
    expect(wrapper.find('[data-testid="section-list-content"]').exists()).toBe(false)
  })

  it('renders the default slot when the list has items', () => {
    const wrapper = mount(SectionListBlock, {
      props: {
        isEmpty: false,
        emptyLabel: 'Aucune donnee',
        listClass: 'space-y-3',
      },
      slots: {
        default: '<div data-testid="item">Element</div>',
      },
    })

    expect(wrapper.find('[data-testid="section-empty-state"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="section-list-content"]').classes()).toContain('space-y-3')
    expect(wrapper.get('[data-testid="item"]').text()).toBe('Element')
  })
})
