import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import InlineFieldError from '../InlineFieldError.vue'

describe('InlineFieldError', () => {
  it('renders the error message when provided', () => {
    const wrapper = mount(InlineFieldError, {
      props: {
        message: 'Champ requis',
      },
    })

    expect(wrapper.get('[data-testid="inline-field-error"]').text()).toBe('Champ requis')
  })

  it('renders nothing when there is no message', () => {
    const wrapper = mount(InlineFieldError, {
      props: {
        message: null,
      },
    })

    expect(wrapper.html()).toBe('<!--v-if-->')
  })
})
