import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive, nextTick, defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { extractResetPasswordTokenFromHash, useResetPasswordToken } from '../useResetPasswordToken'

const mockRoute = reactive<{
  hash: string
  query: Record<string, unknown>
}>({
  hash: '',
  query: {},
})

vi.mock('#app/composables/router', () => ({
  useRoute: () => mockRoute,
}))

const TestHarness = defineComponent({
  setup() {
    const { token } = useResetPasswordToken()
    return {
      token,
    }
  },
  template: '<div>{{ token }}</div>',
})

describe('useResetPasswordToken', () => {
  beforeEach(() => {
    mockRoute.hash = ''
    mockRoute.query = {}
    window.history.replaceState({}, '', '/reset-password')
  })

  it('extracts tokens from the supported hash formats', () => {
    expect(extractResetPasswordTokenFromHash('#token=abc')).toBe('abc')
    expect(extractResetPasswordTokenFromHash('#/reset-password?token=abc')).toBe('abc')
    expect(extractResetPasswordTokenFromHash('#plain-token')).toBe('plain-token')
    expect(extractResetPasswordTokenFromHash('')).toBe('')
  })

  it('prefills from location search and stays in sync with route updates', async () => {
    window.history.replaceState({}, '', '/reset-password?token=from-search')

    const wrapper = mount(TestHarness)
    await nextTick()

    expect(wrapper.text()).toBe('from-search')

    mockRoute.hash = '#token=from-hash'
    await nextTick()
    expect(wrapper.text()).toBe('from-hash')

    mockRoute.query.token = ' from-query '
    await nextTick()
    expect(wrapper.text()).toBe('from-query')
  })
})
