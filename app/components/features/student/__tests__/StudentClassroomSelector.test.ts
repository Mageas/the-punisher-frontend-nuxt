import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentClassroomSelector from '../StudentClassroomSelector.vue'

const mockI18n = {
  t: (key: string) => key,
  te: () => true,
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

describe('StudentClassroomSelector', () => {
  const classrooms = [
    { id: 'class-1', name: '6A' },
    { id: 'class-2', name: '6B' },
  ]

  it('emits the selected classroom and closes the drawer', async () => {
    const wrapper = mount(StudentClassroomSelector, {
      props: {
        open: true,
        classrooms,
        hint: 'Select a classroom',
      },
    })

    const classroomButtons = wrapper.findAll('[data-testid="student-classroom-option"]')
    expect(classroomButtons).toHaveLength(2)

    await classroomButtons[1]!.trigger('click')

    expect(wrapper.emitted('select')).toEqual([['class-2']])
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('shows the selected classroom summary when collapsed', () => {
    const wrapper = mount(StudentClassroomSelector, {
      props: {
        open: false,
        classrooms,
        selectedClassroomId: 'class-2',
        hint: 'Select a classroom',
      },
    })

    expect(wrapper.text()).toContain('common.actions.viewSelectedClassroom')
    expect(wrapper.text()).toContain('6B')
    expect(wrapper.findAll('[data-testid="student-classroom-option"]')).toHaveLength(0)
  })
})
