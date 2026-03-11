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
          Button: true,
          NuxtLink: true,
          Plus: true,
          Star: true,
          AlertCircle: true,
          X: true,
        },
      },
    })

    expect(wrapper.get('form').attributes('class')).toContain('sm:flex-row')
    expect(wrapper.get('form > div').attributes('class')).toContain('flex-1')
    expect(wrapper.getComponent(StudentSelectStub).props('fullWidth')).toBe(true)
    expect(wrapper.getComponent(StudentSelectStub).props('wrapperClass')).toBe('w-full')
  })
})
