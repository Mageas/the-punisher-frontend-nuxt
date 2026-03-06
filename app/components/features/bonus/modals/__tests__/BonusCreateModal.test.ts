import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import BonusCreateModal from '../BonusCreateModal.vue'

const mockBonusService = {
  createBonus: vi.fn(),
}

const mockApiErrors = {
  globalError: ref(null),
  setFormErrors: vi.fn(),
  clearErrors: vi.fn(),
}

const mockI18n = {
  t: (key: string) => key,
  te: () => true,
}

const formValues = reactive({
  classroom_id: '',
  student_id: '11111111-1111-1111-1111-111111111111',
  bonus_type_id: '22222222-2222-2222-2222-222222222222',
  points: 0.25,
})

let mockSubmitValues: Record<string, unknown> = {
  student_id: formValues.student_id,
  bonus_type_id: formValues.bonus_type_id,
  points: formValues.points,
}

const mockSetFieldError = vi.fn()
const mockResetForm = vi.fn()
const mockSetFieldValue = vi.fn()

vi.mock('~/composables/services/useBonusService', () => ({
  useBonusService: () => mockBonusService,
}))

vi.mock('~/composables/useApiErrors', () => ({
  useApiErrors: () => mockApiErrors,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

vi.mock('vee-validate', async () => {
  const original = (await vi.importActual('vee-validate')) as Record<string, unknown>
  return {
    ...original,
    useForm: () => ({
      handleSubmit: (fn: (values: Record<string, unknown>) => Promise<unknown>) => async () => {
        await fn(mockSubmitValues)
      },
      isSubmitting: ref(false),
      resetForm: mockResetForm,
      setFieldError: mockSetFieldError,
      values: formValues,
      setFieldValue: mockSetFieldValue,
      meta: reactive({ valid: true }),
    }),
  }
})

const stubs = {
  BaseModal: {
    template:
      '<div><slot /><button id="submit-btn" @click="$emit(\'submit\')">Submit</button></div>',
    props: ['open', 'title', 'globalError', 'submitting', 'canSubmit', 'submitText'],
  },
  FormField: {
    template:
      '<div><slot :value="\'\'" :handleChange="() => {}" :componentField="{ modelValue: \'\', \'onUpdate:modelValue\': () => {} }" /></div>',
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
    template: '<input data-testid="points-input" v-bind="$attrs" />',
  },
  BonusTypeSelect: {
    template: '<div />',
  },
  ClassroomSelect: {
    template: '<div />',
  },
  StudentSelect: {
    template: '<div />',
  },
  FormMessage: {
    template: '<span><slot /></span>',
  },
}

describe('BonusCreateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiErrors.globalError.value = null
    mockSubmitValues = {
      student_id: '11111111-1111-1111-1111-111111111111',
      bonus_type_id: '22222222-2222-2222-2222-222222222222',
      points: 0.25,
    }
  })

  it('uses a hundredth step for points input', () => {
    const wrapper = mount(BonusCreateModal, {
      props: {
        open: true,
        preselectedStudentId: '11111111-1111-1111-1111-111111111111',
      },
      global: {
        stubs,
      },
    })

    const input = wrapper.get('[data-testid="points-input"]')
    expect(input.attributes('step')).toBe('0.01')
    expect(input.attributes('min')).toBe('0.01')
  })

  it('submits points with hundredth precision', async () => {
    mockBonusService.createBonus.mockResolvedValue({
      id: 'bonus-1',
    })

    const wrapper = mount(BonusCreateModal, {
      props: {
        open: true,
        preselectedStudentId: '11111111-1111-1111-1111-111111111111',
      },
      global: {
        stubs,
      },
    })

    await wrapper.get('#submit-btn').trigger('click')

    expect(mockBonusService.createBonus).toHaveBeenCalledWith({
      student_id: '11111111-1111-1111-1111-111111111111',
      bonus_type_id: '22222222-2222-2222-2222-222222222222',
      points: 0.25,
    })
    expect(wrapper.emitted()).toHaveProperty('created')
  })
})
