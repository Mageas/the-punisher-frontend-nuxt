import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import PasswordFieldControl from '../PasswordFieldControl.vue'

const InputStub = defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    placeholder: {
      type: String,
      default: '',
    },
    ariaInvalid: {
      type: [Boolean, String],
      default: undefined,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    return () =>
      h('input', {
        id: props.id,
        value: props.modelValue,
        type: props.type,
        placeholder: props.placeholder,
        'aria-invalid': props.ariaInvalid,
        onInput: (event: Event) => {
          const target = event.target as HTMLInputElement
          emit('update:modelValue', target.value)

          const listener = attrs.onInput
          if (Array.isArray(listener)) {
            listener.forEach((handler) => handler(event))
          } else if (typeof listener === 'function') {
            listener(event)
          }
        },
      })
  },
})

describe('PasswordFieldControl', () => {
  it('renders the hint when there is no error and forwards input events', async () => {
    const wrapper = mount(PasswordFieldControl, {
      props: {
        id: 'new-password',
        label: 'Nouveau mot de passe',
        fieldName: 'new_password',
        placeholder: 'Votre mot de passe',
        hint: 'Au moins 8 caracteres',
      },
      global: {
        stubs: {
          Label: {
            template: '<label><slot /></label>',
          },
          Input: InputStub,
        },
      },
    })

    expect(wrapper.text()).toContain('Nouveau mot de passe')
    expect(wrapper.text()).toContain('Au moins 8 caracteres')

    const input = wrapper.get('input')
    ;(input.element as HTMLInputElement).value = 'secret123'
    await input.trigger('input')

    expect(wrapper.emitted('update:modelValue')).toEqual([['secret123']])
    expect(wrapper.emitted('clear-error')?.[0]).toEqual(['new_password'])
  })

  it('renders the inline error and hides the hint when an error exists', () => {
    const wrapper = mount(PasswordFieldControl, {
      props: {
        id: 'confirm-password',
        label: 'Confirmer le mot de passe',
        fieldName: 'confirm_password',
        error: 'Les mots de passe ne correspondent pas',
        hint: 'Hint masque',
      },
      global: {
        stubs: {
          Label: {
            template: '<label><slot /></label>',
          },
          Input: InputStub,
        },
      },
    })

    expect(wrapper.text()).toContain('Les mots de passe ne correspondent pas')
    expect(wrapper.text()).not.toContain('Hint masque')
  })
})
