import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, reactive, ref } from 'vue'
import ClassroomBulkBonusModal from '../ClassroomBulkBonusModal.vue'

const mockBonusService = {
  createBulkBonuses: vi.fn(),
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
    useForm: (options: { initialValues: Record<string, unknown> }) => {
      currentValues = reactive({
        ...options.initialValues,
        bonus_type_id: '22222222-2222-2222-2222-222222222222',
        points: 0.25,
        evaluation_label: 'Interrogation surprise',
      })

      return {
        handleSubmit: (fn: (values: Record<string, unknown>) => Promise<unknown>) => async () => {
          await fn({ ...currentValues })
        },
        resetForm: mockResetForm,
        values: currentValues,
        setFieldValue: mockSetFieldValue,
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
      '<div><slot /><button id="submit-btn" type="button" @click="$emit(\'submit\')">Submit</button></div>',
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
  BonusTypeSelect: {
    template: '<div />',
  },
  DatePicker: defineComponent({
    props: ['modelValue', 'time'],
    template:
      '<div data-testid="date-picker">{{ modelValue ? modelValue.toString() : `` }}|{{ time }}</div>',
  }),
  Input: {
    template: '<input data-testid="points-input" v-bind="$attrs" />',
  },
}

describe('ClassroomBulkBonusModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBonusService.createBulkBonuses.mockResolvedValue([{ id: 'bonus-1' }])
  })

  it('submits one classroom-scoped bulk bonus request', async () => {
    const wrapper = mount(ClassroomBulkBonusModal, {
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

    const input = wrapper.get('[data-testid="points-input"]')
    expect(input.attributes('step')).toBe('0.01')
    expect(input.attributes('min')).toBe('0.01')

    await wrapper.get('#submit-btn').trigger('click')

    expect(mockBonusService.createBulkBonuses).toHaveBeenCalledTimes(1)
    expect(mockBonusService.createBulkBonuses).toHaveBeenCalledWith('class-1', {
      student_ids: ['student-1', 'student-2'],
      bonus_type_id: '22222222-2222-2222-2222-222222222222',
      points: 0.25,
      evaluation_label: 'Interrogation surprise',
    })
    expect(mockActionToast.notifyCreateSuccess).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted()).toHaveProperty('created')
  })
})
