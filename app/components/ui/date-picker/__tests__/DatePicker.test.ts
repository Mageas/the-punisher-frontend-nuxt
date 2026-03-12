import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { parseDate } from '@internationalized/date'
import { defineComponent, h, nextTick } from 'vue'
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

const PopoverStub = defineComponent({
  props: {
    open: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    return () => h('div', { 'data-open': String(props.open) }, slots.default?.())
  },
})

const CalendarStub = defineComponent({
  emits: ['update:model-value'],
  setup(_, { emit }) {
    return () =>
      h(
        'button',
        {
          type: 'button',
          'data-testid': 'calendar-select',
          onClick: () => emit('update:model-value', parseDate('2026-03-20')),
        },
        'select date',
      )
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

  it('renders the Ok button only when time selection is enabled', () => {
    const dateOnlyWrapper = mount(DatePicker, {
      global: {
        mocks: {
          $t: (key: string) => (key === 'common.actions.ok' ? 'Ok' : key),
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

    expect(dateOnlyWrapper.text()).not.toContain('Ok')

    const dateTimeWrapper = mount(DatePicker, {
      props: {
        showTime: true,
      },
      global: {
        mocks: {
          $t: (key: string) => (key === 'common.actions.ok' ? 'Ok' : key),
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

    expect(dateTimeWrapper.text()).toContain('Ok')
  })

  it('closes the popover when clicking Ok in date-time mode', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        showTime: true,
      },
      global: {
        mocks: {
          $t: (key: string) => (key === 'common.actions.ok' ? 'Ok' : key),
        },
        stubs: {
          Button: ButtonStub,
          Popover: PopoverStub,
          PopoverTrigger: passthroughStub,
          PopoverContent: passthroughStub,
          Calendar: true,
          CalendarIcon: true,
        },
      },
    })

    ;(wrapper.vm as any).$.setupState.openPopover = true
    await nextTick()

    expect(wrapper.get('[data-open]').attributes('data-open')).toBe('true')

    const okButton = wrapper
      .findAll('button')
      .find((button) => button.text() === 'Ok')

    expect(okButton).toBeDefined()

    await okButton!.trigger('click')
    await nextTick()

    expect(wrapper.get('[data-open]').attributes('data-open')).toBe('false')
  })

  it('closes the popover when pressing Enter in the hours input', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: parseDate('2026-03-15'),
        showTime: true,
      },
      global: {
        mocks: {
          $t: (key: string) => (key === 'common.actions.ok' ? 'Ok' : key),
        },
        stubs: {
          Button: ButtonStub,
          Popover: PopoverStub,
          PopoverTrigger: passthroughStub,
          PopoverContent: passthroughStub,
          Calendar: true,
          CalendarIcon: true,
        },
      },
    })

    ;(wrapper.vm as any).$.setupState.openPopover = true
    await nextTick()

    const [hoursInput] = wrapper.findAll('input')

    expect(hoursInput).toBeDefined()

    ;(hoursInput!.element as HTMLInputElement).value = '12'
    await hoursInput!.trigger('keydown.enter')
    await nextTick()

    expect(wrapper.get('[data-open]').attributes('data-open')).toBe('false')
    expect(wrapper.text()).toContain('12:00')
  })

  it('moves focus to the hours input after selecting a date in date-time mode', async () => {
    const wrapper = mount(DatePicker, {
      attachTo: document.body,
      props: {
        showTime: true,
      },
      global: {
        mocks: {
          $t: (key: string) => (key === 'common.actions.ok' ? 'Ok' : key),
        },
        stubs: {
          Button: ButtonStub,
          Popover: passthroughStub,
          PopoverTrigger: passthroughStub,
          PopoverContent: passthroughStub,
          Calendar: CalendarStub,
          CalendarIcon: true,
        },
      },
    })

    await wrapper.get('[data-testid="calendar-select"]').trigger('click')
    await nextTick()

    const [hoursInput] = wrapper.findAll('input')

    expect(hoursInput).toBeDefined()
    expect(document.activeElement).toBe(hoursInput!.element)

    wrapper.unmount()
  })
})
