import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, reactive, ref } from 'vue'
import ClassroomBulkPenaltyModal from '../ClassroomBulkPenaltyModal.vue'

const mockPenaltyService = {
  createBulkPenalties: vi.fn(),
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

let currentValues: Record<string, unknown>

const mockResetForm = vi.fn((payload?: { values?: Record<string, unknown> }) => {
  if (!payload?.values) return
  Object.assign(currentValues, payload.values)
})
const mockSetFieldValue = vi.fn((field: string, value: unknown) => {
  currentValues[field] = value
})

vi.mock('~/composables/services/usePenaltyService', () => ({
  usePenaltyService: () => mockPenaltyService,
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
    useForm: (options: { initialValues: Record<string, unknown> }) => {
      currentValues = reactive({
        ...options.initialValues,
        penalty_type_id: '44444444-4444-4444-4444-444444444444',
        evaluation_label: 'Retard collectif',
      })

      return {
        handleSubmit: (fn: (values: Record<string, unknown>) => Promise<unknown>) => async () => {
          await fn({ ...currentValues })
        },
        resetForm: mockResetForm,
        setFieldValue: mockSetFieldValue,
        values: currentValues,
        meta: ref({ valid: true }),
      }
    },
  }
})

const FormFieldStub = defineComponent({
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        slots.default?.({
          value: currentValues?.[props.name],
          handleChange: (value: unknown) => {
            mockSetFieldValue(props.name, value)
          },
          componentField: {
            modelValue: currentValues?.[props.name],
            'onUpdate:modelValue': (value: unknown) => {
              mockSetFieldValue(props.name, value)
            },
          },
        }),
      )
  },
})

const stubs = {
  BaseModal: defineComponent({
    emits: ['submit'],
    template:
      '<div><slot /><button id="submit-btn" type="button" @click="$emit(`submit`)">Submit</button></div>',
  }),
  FormField: FormFieldStub,
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
  PenaltyTypeSelect: {
    template: '<div />',
  },
  DatePicker: defineComponent({
    props: ['modelValue', 'time'],
    template:
      '<div data-testid="date-picker">{{ modelValue ? modelValue.toString() : `` }}|{{ time }}</div>',
  }),
  Input: {
    template: '<input />',
  },
}

describe('ClassroomBulkPenaltyModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiErrors.globalError.value = null
    mockPenaltyService.createBulkPenalties.mockResolvedValue([{ id: 'penalty-1' }])
  })

  it('submits one classroom-scoped bulk penalty request', async () => {
    const wrapper = mount(ClassroomBulkPenaltyModal, {
      props: {
        open: true,
        classroomId: 'class-1',
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

    await wrapper.get('#submit-btn').trigger('click')

    expect(mockPenaltyService.createBulkPenalties).toHaveBeenCalledTimes(1)
    expect(mockPenaltyService.createBulkPenalties).toHaveBeenCalledWith('class-1', {
      student_ids: ['student-1', 'student-2'],
      penalty_type_id: '44444444-4444-4444-4444-444444444444',
      evaluation_label: 'Retard collectif',
    })
    expect(mockActionToast.notifyCreateSuccess).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted()).toHaveProperty('created')
  })
})
