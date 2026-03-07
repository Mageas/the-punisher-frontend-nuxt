import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentAvatar from '../StudentAvatar.vue'

describe('StudentAvatar', () => {
  it('uses shared initials formatting', () => {
    const wrapper = mount(StudentAvatar, {
      props: {
        firstName: 'Jean',
        lastName: 'Dupont',
      },
    })

    expect(wrapper.text()).toBe('JD')
  })

  it('supports size, tone and bordered variants', () => {
    const wrapper = mount(StudentAvatar, {
      props: {
        firstName: 'Lina',
        lastName: 'Martin',
        size: 'xl',
        tone: 'muted',
        bordered: true,
      },
    })

    expect(wrapper.classes()).toContain('h-16')
    expect(wrapper.classes()).toContain('w-16')
    expect(wrapper.classes()).toContain('bg-muted')
    expect(wrapper.classes()).toContain('border-2')
  })
})
