import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SectionHeaderPagination from '../SectionHeaderPagination.vue'

describe('SectionHeaderPagination', () => {
  it('does not render when totalPages is 1', () => {
    const wrapper = mount(SectionHeaderPagination, {
      props: {
        page: 1,
        totalPages: 1,
      },
    })

    expect(wrapper.find('[data-testid="section-header-pagination"]').exists()).toBe(false)
  })

  it('renders current page indicator and boundary disabled states', () => {
    const wrapper = mount(SectionHeaderPagination, {
      props: {
        page: 1,
        totalPages: 4,
      },
    })

    expect(wrapper.text()).toContain('1/4')
    expect(wrapper.get('button[aria-label="Previous page"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="Next page"]').attributes('disabled')).toBeUndefined()
  })

  it('emits update:page for previous and next actions', async () => {
    const wrapper = mount(SectionHeaderPagination, {
      props: {
        page: 2,
        totalPages: 4,
      },
    })

    await wrapper.get('button[aria-label="Previous page"]').trigger('click')
    await wrapper.get('button[aria-label="Next page"]').trigger('click')

    expect(wrapper.emitted('update:page')).toEqual([[1], [3]])
  })

  it('disables both controls while loading', () => {
    const wrapper = mount(SectionHeaderPagination, {
      props: {
        page: 2,
        totalPages: 4,
        loading: true,
      },
    })

    expect(wrapper.get('button[aria-label="Previous page"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="Next page"]').attributes('disabled')).toBeDefined()
  })

  it('disables both controls when disabled is true', () => {
    const wrapper = mount(SectionHeaderPagination, {
      props: {
        page: 2,
        totalPages: 4,
        disabled: true,
      },
    })

    expect(wrapper.get('button[aria-label="Previous page"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="Next page"]').attributes('disabled')).toBeDefined()
  })
})
