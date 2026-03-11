import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import ClassroomBulkBonusModal from '../ClassroomBulkBonusModal.vue'

const mockBonusService = {
  createBonus: vi.fn(),
}

const mockApiErrors = {
  globalError: ref(null),
  clearErrors: vi.fn(),
  handleApiError: vi.fn(),
}

const mockActionToast = {
  notifyCreateSuccess: vi.fn(),
}

const mockI18n = {
  t: (key: string) => key,
  te: () => true,
}

const formValues = reactive({
  bonus_type_id: '22222222-2222-2222-2222-222222222222',
  points: 0.25,
  occurred_at: undefined,
  occurred_at_time: '08:00',
  evaluation_label: 'Interrogation surprise',
})

const mockResetForm = vi.fn()
const mockSetFieldValue = vi.fn()

vi.mock('~/composables/services/useBonusService', () => ({
  useBonusService: () => mockBonusService,
}))

vi.mock('~/composables/useApiErrors', () => ({
  useApiErrors: () => mockApiErrors,
}))

vi.mock('~/composables/useActionToast', () => ({
  useActionToast: () => mockActionToast,
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
        await fn({ ...formValues })
      },
      resetForm: mockResetForm,
      values: formValues,
      setFieldValue: mockSetFieldValue,
      meta: reactive({ valid: true }),
    }),
  }
})

const stubs = {
  BaseModal: {
    template:
      '<div><slot /><button id="submit-btn" type="button" @click="$emit(\'submit\')">Submit</button></div>',
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
  FormMessage: {
    template: '<span><slot /></span>',
  },
  BonusTypeSelect: {
    template: '<div />',
  },
  DatePicker: {
    template: '<div />',
  },
  Input: {
    template: '<input data-testid="points-input" v-bind="$attrs" />',
  },
}

describe('ClassroomBulkBonusModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBonusService.createBonus.mockResolvedValue({ id: 'bonus-1' })
  })

  it('submits the same bonus payload for each selected student', async () => {
    const wrapper = mount(ClassroomBulkBonusModal, {
      props: {
        open: true,
        students: [
          {
            id: 'student-1',
            first_name: 'Jane',
            last_name: 'Doe',
            classrooms: [],
            available_bonus_points: 0,
            penalty_count: 0,
            created_at: '2026-03-11T08:00:00.000Z',
            updated_at: '2026-03-11T08:00:00.000Z',
          },
          {
            id: 'student-2',
            first_name: 'John',
            last_name: 'Smith',
            classrooms: [],
            available_bonus_points: 0,
            penalty_count: 0,
            created_at: '2026-03-11T08:00:00.000Z',
            updated_at: '2026-03-11T08:00:00.000Z',
          },
        ],
      },
      global: {
        stubs,
      },
    })

    const input = wrapper.get('[data-testid="points-input"]')
    expect(input.attributes('step')).toBe('0.01')
    expect(input.attributes('min')).toBe('0.01')

    await wrapper.get('#submit-btn').trigger('click')

    expect(mockBonusService.createBonus).toHaveBeenCalledTimes(2)
    expect(mockBonusService.createBonus).toHaveBeenNthCalledWith(1, {
      student_id: 'student-1',
      bonus_type_id: '22222222-2222-2222-2222-222222222222',
      points: 0.25,
      evaluation_label: 'Interrogation surprise',
    })
    expect(mockBonusService.createBonus).toHaveBeenNthCalledWith(2, {
      student_id: 'student-2',
      bonus_type_id: '22222222-2222-2222-2222-222222222222',
      points: 0.25,
      evaluation_label: 'Interrogation surprise',
    })
    expect(mockActionToast.notifyCreateSuccess).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted()).toHaveProperty('created')
  })
})
