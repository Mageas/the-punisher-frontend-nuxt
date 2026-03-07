import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { parseDate } from '@internationalized/date'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import PunishmentCreateModal from '../PunishmentCreateModal.vue'

const mockPunishmentService = {
  createPunishment: vi.fn(),
}

const mockStudentService = {
  getStudentById: vi.fn(),
}

const mockScheduleService = {
  getClassroomNextLessons: vi.fn(),
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

let currentValues: Record<string, unknown>

const mockSetFieldError = vi.fn()
const mockResetForm = vi.fn((payload?: { values?: Record<string, unknown> }) => {
  if (!payload?.values) return
  Object.assign(currentValues, payload.values)
})
const mockSetFieldValue = vi.fn((field: string, value: unknown) => {
  currentValues[field] = value
})

vi.mock('~/composables/services/usePunishmentService', () => ({
  usePunishmentService: () => mockPunishmentService,
}))

vi.mock('~/composables/services/useStudentService', () => ({
  useStudentService: () => mockStudentService,
}))

vi.mock('~/composables/services/useScheduleService', () => ({
  useScheduleService: () => mockScheduleService,
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
    useForm: (options: { initialValues: Record<string, unknown> }) => {
      currentValues = reactive({ ...options.initialValues })

      return {
        handleSubmit:
          (fn: (formValues: Record<string, unknown>) => Promise<unknown>) => async () => {
            await fn({ ...currentValues })
          },
        isSubmitting: ref(false),
        resetForm: mockResetForm,
        setFieldError: mockSetFieldError,
        values: currentValues,
        setFieldValue: mockSetFieldValue,
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
  ClassroomSelect: {
    template: '<div />',
  },
  StudentSelect: {
    template: '<div />',
  },
  StudentClassroomSelector: defineComponent({
    props: {
      classrooms: {
        type: Array,
        default: () => [],
      },
      selectedClassroomId: {
        type: String,
        default: '',
      },
      open: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['select', 'update:open'],
    computed: {
      selectedClassroomName() {
        return (
          (
            this.classrooms as Array<{
              id: string
              name: string
            }>
          ).find((classroom) => classroom.id === this.selectedClassroomId)?.name ?? ''
        )
      },
    },
    template: `
      <div>
        <div v-if="open">
          <button
            v-for="classroom in classrooms"
            :key="classroom.id"
            data-testid="student-classroom-option"
            type="button"
            @click="$emit('select', classroom.id)"
          >
            {{ classroom.name }}
          </button>
        </div>
        <div v-else>
          <span>{{
            selectedClassroomName
              ? 'common.actions.viewSelectedClassroom'
              : 'common.actions.chooseClassroom'
          }}</span>
          <span v-if="selectedClassroomName">{{ selectedClassroomName }}</span>
        </div>
      </div>
    `,
  }),
  NextLessonSelector: {
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

describe('PunishmentCreateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiErrors.globalError.value = null
    mockPunishmentService.createPunishment.mockResolvedValue({ id: 'punishment-1' })
    mockStudentService.getStudentById.mockResolvedValue({
      id: 'student-1',
      classrooms: [
        { id: 'class-1', name: '6A' },
        { id: 'class-2', name: '6B' },
      ],
    })
    mockScheduleService.getClassroomNextLessons.mockResolvedValue([
      {
        date: '2026-03-18',
        start_time: '10:00',
        end_time: '11:00',
      },
    ])
  })

  it('collapses the classroom selector after a class is chosen', async () => {
    const wrapper = mount(PunishmentCreateModal, {
      props: {
        open: false,
        preselectedStudentId: 'student-1',
      },
      global: {
        stubs,
      },
    })

    await wrapper.setProps({ open: true })
    await flushPromises()

    expect(mockStudentService.getStudentById).toHaveBeenCalledWith('student-1')

    const classroomButtons = wrapper.findAll('[data-testid="student-classroom-option"]')
    expect(classroomButtons).toHaveLength(2)
    const [firstClassroomButton, secondClassroomButton] = classroomButtons
    expect(firstClassroomButton?.text()).toContain('6A')
    expect(secondClassroomButton?.text()).toContain('6B')

    await firstClassroomButton?.trigger('click')
    await flushPromises()

    expect(wrapper.findAll('[data-testid="student-classroom-option"]')).toHaveLength(0)
    expect(wrapper.text()).toContain('common.actions.viewSelectedClassroom')
    expect(wrapper.text()).toContain('6A')
  })

  it('submits due_at without sending classroom_id', async () => {
    const wrapper = mount(PunishmentCreateModal, {
      props: {
        open: false,
        preselectedStudentId: 'student-1',
      },
      global: {
        stubs,
      },
    })

    await wrapper.setProps({ open: true })
    await flushPromises()

    currentValues.punishment_type_id = '55555555-5555-5555-5555-555555555555'
    currentValues.due_at = parseDate('2026-03-18')
    currentValues.due_at_time = '10:00'

    await wrapper.get('#submit-btn').trigger('click')

    expect(mockPunishmentService.createPunishment).toHaveBeenCalledTimes(1)

    const [payload] = mockPunishmentService.createPunishment.mock.calls[0] ?? []
    expect(payload).toMatchObject({
      student_id: 'student-1',
      punishment_type_id: '55555555-5555-5555-5555-555555555555',
    })
    expect(payload).toHaveProperty('due_at')
    expect(payload).not.toHaveProperty('classroom_id')
    expect(wrapper.emitted()).toHaveProperty('created')
  })
})
