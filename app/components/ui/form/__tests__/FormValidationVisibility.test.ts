import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, provide, reactive, ref } from 'vue'
import { FieldContextKey, PublicFormContextKey } from 'vee-validate'
import { Input } from '~/components/ui/input'
import { FormControl, FormItem, FormLabel, FormMessage } from '~/components/ui/form'

const TestField = defineComponent({
  components: {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
  },
  setup() {
    const submitCount = ref(0)

    provide(FieldContextKey, {
      name: 'name',
      errorMessage: ref('Name too short'),
      meta: reactive({
        valid: false,
        dirty: false,
        touched: false,
        validated: true,
        required: true,
        pending: false,
      }),
    } as never)

    provide(PublicFormContextKey, {
      submitCount,
    } as never)

    return {
      submitCount,
    }
  },
  template: `
    <div>
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input data-testid="name-input" model-value="" />
        </FormControl>
        <FormMessage />
      </FormItem>

      <button type="button" @click="submitCount += 1">Submit</button>
    </div>
  `,
})

describe('Form validation visibility', () => {
  it('keeps field errors hidden until the first submit', async () => {
    const wrapper = mount(TestField)
    const input = wrapper.get('[data-testid="name-input"]')

    expect(wrapper.text()).not.toContain('Name too short')
    expect(input.attributes('aria-invalid')).not.toBe('true')
    expect(wrapper.get('label').attributes('data-error')).not.toBe('true')

    await wrapper.get('button').trigger('click')

    expect(wrapper.text()).toContain('Name too short')
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('label').attributes('data-error')).toBe('true')
  })
})
