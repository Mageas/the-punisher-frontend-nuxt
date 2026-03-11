import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import ClassroomProfileStudentsSection from '../ClassroomProfileStudentsSection.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    te: () => true,
  }),
}))

vi.mock('~/composables/useGlobalErrorToast', () => ({
  useGlobalErrorToast: vi.fn(),
}))

const StudentSelectStub = defineComponent({
  name: 'StudentSelect',
  props: {
    modelValue: { type: String, default: '' },
    excludeIds: { type: Array, default: () => [] },
    placeholder: { type: String, default: undefined },
    emptyText: { type: String, default: undefined },
    keepFocusOnSelect: { type: Boolean, default: false },
    fullWidth: { type: Boolean, default: true },
    wrapperClass: { type: String, default: undefined },
  },
  emits: ['update:modelValue'],
  template: '<div data-testid="student-select" />',
})

const ButtonStub = defineComponent({
  emits: ['click'],
  template: '<button type="button" @click="$emit(`click`, $event)"><slot /></button>',
})

function buildStudent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'student-1',
    first_name: 'Jane',
    last_name: 'Doe',
    classrooms: [],
    available_bonus_points: 2,
    penalty_count: 1,
    created_at: '2026-03-11T08:00:00.000Z',
    updated_at: '2026-03-11T08:00:00.000Z',
    ...overrides,
  }
}

describe('ClassroomProfileStudentsSection', () => {
  it('keeps the add-student search bar stretched up to the action button', () => {
    const wrapper = mount(ClassroomProfileStudentsSection, {
      props: {
        students: [],
        studentCount: 0,
      },
      global: {
        stubs: {
          StudentSelect: StudentSelectStub,
          LoadingButton: {
            template: '<button data-testid="loading-button"><slot /></button>',
          },
          FormLabel: true,
          StudentAvatar: true,
          Button: ButtonStub,
          NuxtLink: true,
          Plus: true,
          Star: true,
          AlertCircle: true,
          AlertTriangle: true,
          CheckSquare: true,
          Gavel: true,
          X: true,
        },
      },
    })

    expect(wrapper.get('form').attributes('class')).toContain('sm:flex-row')
    expect(wrapper.get('form > div').attributes('class')).toContain('flex-1')
    expect(wrapper.getComponent(StudentSelectStub).props('fullWidth')).toBe(true)
    expect(wrapper.getComponent(StudentSelectStub).props('wrapperClass')).toBe('w-full')
  })

  it('emits bulk bonus, penalty, and punishment actions for the selected students', async () => {
    const wrapper = mount(ClassroomProfileStudentsSection, {
      props: {
        students: [
          buildStudent(),
          buildStudent({
            id: 'student-2',
            first_name: 'John',
            last_name: 'Smith',
          }),
        ],
        studentCount: 2,
      },
      global: {
        stubs: {
          StudentSelect: StudentSelectStub,
          LoadingButton: {
            template: '<button data-testid="loading-button"><slot /></button>',
          },
          FormLabel: true,
          StudentAvatar: true,
          Button: ButtonStub,
          Checkbox: {
            template: '<div data-testid="checkbox" />',
          },
          NuxtLink: true,
          Plus: true,
          Star: true,
          AlertCircle: true,
          AlertTriangle: true,
          CheckSquare: true,
          Gavel: true,
          X: true,
        },
      },
    })

    const toggleButton = wrapper
      .findAll('button')
      .find((node) => node.text().includes('classProfile.selection.enter'))
    expect(toggleButton).toBeDefined()
    await toggleButton!.trigger('click')

    const studentName = wrapper.findAll('p').find((node) => node.text() === 'Jane Doe')
    expect(studentName).toBeDefined()
    await studentName!.trigger('click')

    const bonusButton = wrapper
      .findAll('button')
      .find((node) => node.text().includes('classProfile.selection.addBonus'))
    expect(bonusButton).toBeDefined()
    await bonusButton!.trigger('click')

    const penaltyButton = wrapper
      .findAll('button')
      .find((node) => node.text().includes('classProfile.selection.addPenalty'))
    expect(penaltyButton).toBeDefined()
    await penaltyButton!.trigger('click')

    const punishmentButton = wrapper
      .findAll('button')
      .find((node) => node.text().includes('classProfile.selection.addPunishment'))
    expect(punishmentButton).toBeDefined()
    await punishmentButton!.trigger('click')

    expect(wrapper.emitted('bulkBonus')).toEqual([[['student-1']]])
    expect(wrapper.emitted('bulkPenalty')).toEqual([[['student-1']]])
    expect(wrapper.emitted('bulkPunishment')).toEqual([[['student-1']]])
  })
})
