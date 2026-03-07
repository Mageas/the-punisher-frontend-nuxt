import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import LoadingButton from '../LoadingButton.vue'

const ButtonStub = defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          disabled: props.disabled,
        },
        slots.default?.(),
      )
  },
})

describe('LoadingButton', () => {
  it('renders a spinner and disables the button while loading', () => {
    const wrapper = mount(LoadingButton, {
      props: {
        loading: true,
      },
      attrs: {
        type: 'submit',
      },
      global: {
        stubs: {
          Button: ButtonStub,
        },
      },
    })

    const button = wrapper.get('button')

    expect(button.attributes('disabled')).toBeDefined()
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.attributes('data-loading')).toBe('true')
    expect(button.find('span.animate-spin').exists()).toBe(true)
  })

  it('keeps the button enabled when idle', () => {
    const wrapper = mount(LoadingButton, {
      global: {
        stubs: {
          Button: ButtonStub,
        },
      },
    })

    const button = wrapper.get('button')

    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.attributes('aria-busy')).toBeUndefined()
    expect(button.find('span.animate-spin').exists()).toBe(false)
  })
})
