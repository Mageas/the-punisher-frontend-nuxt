import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import ClassroomBulkPunishmentModal from '../ClassroomBulkPunishmentModal.vue'
import { applyTimeInputToDate, toApiDateTimeString } from '~/lib/date-time'

const mockPunishmentService = {
  createBulkPunishments: vi.fn(),
}

const mockScheduleService = {
  getClassroomNextLessons: vi.fn(),
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
const mockSetFieldError = vi.fn()

vi.mock('~/composables/services/usePunishmentService', () => ({
  usePunishmentService: () => mockPunishmentService,
}))

vi.mock('~/composables/services/useScheduleService', () => ({
  useScheduleService: () => mockScheduleService,
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
        punishment_type_id: '33333333-3333-3333-3333-333333333333',
        evaluation_label: 'Lecture surveillée',
      })

      return {
        handleSubmit: (fn: (values: Record<string, unknown>) => Promise<unknown>) => async () => {
          await fn({ ...currentValues })
        },
        resetForm: mockResetForm,
        setFieldError: mockSetFieldError,
        setFieldValue: mockSetFieldValue,
        values: currentValues,
        meta: ref({ valid: true }),
      }
    },
  }
})

async function flushPromises() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
}

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
  PunishmentTypeSelect: {
    template: '<div />',
  },
  NextLessonSelector: defineComponent({
    props: {
      lessons: {
        type: Array,
        default: () => [],
      },
    },
    emits: ['select', 'update:open'],
    template: `
      <div>
        <button
          v-for="lesson in lessons"
          :key="lesson.date + lesson.start_time"
          data-testid="next-lesson-option"
          type="button"
          @click="$emit('select', lesson)"
        >
          {{ lesson.date }} {{ lesson.start_time }}
        </button>
      </div>
    `,
  }),
  DatePicker: defineComponent({
    props: ['modelValue', 'time'],
    template:
      '<div data-testid="date-picker">{{ modelValue ? modelValue.toString() : `` }}|{{ time }}</div>',
  }),
  Input: {
    template: '<input />',
  },
}

describe('ClassroomBulkPunishmentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiErrors.globalError.value = null
    mockPunishmentService.createBulkPunishments.mockResolvedValue([{ id: 'punishment-1' }])
    mockScheduleService.getClassroomNextLessons.mockResolvedValue([
      {
        date: '2026-03-18',
        start_time: '10:00',
        end_time: '11:00',
      },
    ])
  })

  it('uses the current classroom next lessons and submits one classroom-scoped bulk request', async () => {
    const wrapper = mount(ClassroomBulkPunishmentModal, {
      props: {
        open: false,
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

    await wrapper.setProps({ open: true })
    await flushPromises()

    expect(mockScheduleService.getClassroomNextLessons).toHaveBeenCalledWith('class-1')

    currentValues.punishment_type_id = '33333333-3333-3333-3333-333333333333'
    currentValues.evaluation_label = 'Lecture surveillée'
    await wrapper.get('[data-testid="next-lesson-option"]').trigger('click')
    await wrapper.get('#submit-btn').trigger('click')

    const dueDate = parseDate('2026-03-18').toDate(getLocalTimeZone())
    applyTimeInputToDate(dueDate, '10:00')
    const expectedDueAt = toApiDateTimeString(dueDate)

    expect(mockPunishmentService.createBulkPunishments).toHaveBeenCalledTimes(1)
    expect(mockPunishmentService.createBulkPunishments).toHaveBeenCalledWith('class-1', {
      student_ids: ['student-1', 'student-2'],
      punishment_type_id: '33333333-3333-3333-3333-333333333333',
      due_at: expectedDueAt,
      evaluation_label: 'Lecture surveillée',
    })
    expect(mockActionToast.notifyCreateSuccess).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted()).toHaveProperty('created')
  })
})
