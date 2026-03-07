import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { parseDate } from '@internationalized/date'
import { defineComponent, h } from 'vue'
import DatePicker from '../DatePicker.vue'

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

const passthroughStub = defineComponent({
  setup(_, { slots }) {
    return () => h('div', slots.default?.())
  },
})

describe('DatePicker', () => {
  it('forwards validation attributes to the trigger button', () => {
    const wrapper = mount(DatePicker, {
      attrs: {
        id: 'due-at',
        'aria-invalid': 'true',
        'aria-describedby': 'due-at-message',
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Button: ButtonStub,
          Popover: passthroughStub,
          PopoverTrigger: passthroughStub,
          PopoverContent: passthroughStub,
          Calendar: true,
          CalendarIcon: true,
        },
      },
    })

    const button = wrapper.get('button')

    expect(button.attributes('id')).toBe('due-at')
    expect(button.attributes('aria-invalid')).toBe('true')
    expect(button.attributes('aria-describedby')).toBe('due-at-message')
  })

  it('displays only hours and minutes when the time contains seconds', () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: parseDate('2026-03-15'),
        time: '10:15:45',
        showTime: true,
      },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
        stubs: {
          Button: ButtonStub,
          Popover: passthroughStub,
          PopoverTrigger: passthroughStub,
          PopoverContent: passthroughStub,
          Calendar: true,
          CalendarIcon: true,
        },
      },
    })

    expect(wrapper.text()).toContain('10:15')
    expect(wrapper.text()).not.toContain('10:15:45')
  })
})
