import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NextLessonSelector from '../NextLessonSelector.vue'
import { getNextLessonSelectionKey } from '~/lib/punishment-next-lesson'

const mockI18n = {
  t: (key: string) => key,
  te: () => true,
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

describe('NextLessonSelector', () => {
  const lessons = [
    {
      date: '2026-03-18',
      start_time: '10:00',
      end_time: '11:00',
    },
    {
      date: '2026-03-25',
      start_time: '14:00',
      end_time: '15:00',
    },
  ]

  it('emits the selected lesson and closes the drawer', async () => {
    const wrapper = mount(NextLessonSelector, {
      props: {
        open: true,
        lessons,
        selectedLessonKey: getNextLessonSelectionKey(lessons[0]!),
        title: 'Next lessons',
        hint: 'Pick a lesson',
        emptyText: 'No lessons',
      },
    })

    const lessonButtons = wrapper.findAll('[data-testid="next-lesson-option"]')
    expect(lessonButtons).toHaveLength(2)

    await lessonButtons[1]!.trigger('click')

    expect(wrapper.emitted('select')).toEqual([[lessons[1]]])
    expect(wrapper.emitted('update:open')).toEqual([[false]])
  })

  it('shows the selected lesson summary when collapsed', () => {
    const wrapper = mount(NextLessonSelector, {
      props: {
        open: false,
        lessons,
        selectedLessonKey: getNextLessonSelectionKey(lessons[0]!),
        title: 'Next lessons',
        hint: 'Pick a lesson',
        emptyText: 'No lessons',
      },
    })

    expect(wrapper.text()).toContain('common.actions.viewNextLessons')
    expect(wrapper.text()).toContain('10:00')
    expect(wrapper.findAll('[data-testid="next-lesson-option"]')).toHaveLength(0)
  })
})
