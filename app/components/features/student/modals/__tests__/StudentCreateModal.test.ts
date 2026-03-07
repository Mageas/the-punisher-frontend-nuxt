import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentCreateModal from '../StudentCreateModal.vue'
import { nextTick, reactive, ref } from 'vue'

// -- Mocks --
const mockI18n = {
  t: (key: string) => key,
  te: () => true,
}

const mockApiErrors = {
  globalError: ref(null),
  setFormErrors: vi.fn(),
  clearErrors: vi.fn(),
}

const mockStudentService = {
  createStudent: vi.fn(),
}

let shouldInvokeSubmitHandler = true

vi.mock('#app', () => ({
  useNuxtApp: () => ({ $api: vi.fn() }),
  useRuntimeConfig: () => ({ public: { apiBaseUrl: '' } }),
}))

// Mock auto-imported composables
vi.mock('~/composables/services/useStudentService', () => ({
  useStudentService: () => mockStudentService,
}))

vi.mock('~/composables/useApiErrors', () => ({
  useApiErrors: () => mockApiErrors,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

// Mock components to avoid deep rendering issues
const stubs = {
  BaseModal: {
    template:
      '<div :data-submitting="String(!!submitting)"><slot /><button id="submit-btn" @click="$emit(\'submit\')">Submit</button></div>',
    props: ['open', 'title', 'globalError', 'submitting', 'canSubmit', 'submitText'],
  },
  FormField: {
    template:
      "<div><slot :componentField=\"{ modelValue: '', 'onUpdate:modelValue': (v) => {} }\" /></div>",
  },
  FormItem: {
    template: '<div><slot /></div>',
  },
  FormLabel: {
    template: '<label><slot /></label>',
  },
  FormControl: {
    template: '<div><slot /></div>',
  },
  Input: {
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
  },
  FormMessage: {
    template: '<span><slot /></span>',
  },
}

vi.mock('vee-validate', async () => {
  const original = (await vi.importActual('vee-validate')) as Record<string, unknown>
  return {
    ...original,
    useForm: () => ({
      handleSubmit: (fn: (values: unknown) => Promise<unknown>) => async (_e: unknown) => {
        if (shouldInvokeSubmitHandler) {
          await fn({ first_name: 'John', last_name: 'Doe' })
        }
      },
      isSubmitting: ref(false),
      resetForm: vi.fn(),
      setFieldError: vi.fn(),
      meta: reactive({ valid: true }),
    }),
  }
})

async function flushPromises() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

describe('StudentCreateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiErrors.globalError.value = null
    shouldInvokeSubmitHandler = true
  })

  it('renders correctly when open', () => {
    const wrapper = mount(StudentCreateModal, {
      props: {
        open: true,
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.find('label').text()).toContain('common.labels.name')
  })

  it('calls createStudent on submit', async () => {
    mockStudentService.createStudent.mockResolvedValue({
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
    })

    const wrapper = mount(StudentCreateModal, {
      props: {
        open: true,
      },
      global: {
        stubs,
      },
    })

    // Simulate form submission
    await wrapper.find('#submit-btn').trigger('click')
    await flushPromises()

    expect(mockStudentService.createStudent).toHaveBeenCalled()
    expect(wrapper.emitted()).toHaveProperty('created')
  })

  it('handles API errors on submit', async () => {
    const error = new Error('API Error')
    mockStudentService.createStudent.mockRejectedValue(error)

    const wrapper = mount(StudentCreateModal, {
      props: {
        open: true,
      },
      global: {
        stubs,
      },
    })

    await wrapper.find('#submit-btn').trigger('click')
    await flushPromises()

    expect(mockApiErrors.setFormErrors).toHaveBeenCalledWith(expect.any(Function), error)
  })

  it('does not expose a loading state when validation blocks submission', async () => {
    shouldInvokeSubmitHandler = false

    const wrapper = mount(StudentCreateModal, {
      props: {
        open: true,
      },
      global: {
        stubs,
      },
    })

    await wrapper.find('#submit-btn').trigger('click')

    expect(mockStudentService.createStudent).not.toHaveBeenCalled()
    expect(wrapper.find('[data-submitting]').attributes('data-submitting')).toBe('false')
  })
})
