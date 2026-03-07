import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppSidebarUserSummary from '../AppSidebarUserSummary.vue'

describe('AppSidebarUserSummary', () => {
  it('renders the initials, full name and email', () => {
    const wrapper = mount(AppSidebarUserSummary, {
      props: {
        initials: 'JD',
        fullName: 'Jean Dupont',
        email: 'jean@example.com',
      },
    })

    expect(wrapper.text()).toContain('JD')
    expect(wrapper.text()).toContain('Jean Dupont')
    expect(wrapper.text()).toContain('jean@example.com')
  })

  it('hides the email line when the email is missing', () => {
    const wrapper = mount(AppSidebarUserSummary, {
      props: {
        initials: 'LM',
        fullName: 'Lina Martin',
      },
    })

    expect(wrapper.text()).toContain('LM')
    expect(wrapper.text()).toContain('Lina Martin')
    expect(wrapper.text()).not.toContain('@')
  })
})
