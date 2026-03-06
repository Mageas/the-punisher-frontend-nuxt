import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ScheduleTimetable from '../ScheduleTimetable.vue'

const mockI18n = {
  t: (key: string) => key,
  te: () => true,
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

function mountTimetable() {
  return mount(ScheduleTimetable, {
    props: {
      slots: [],
      weekdays: ['monday'],
      startHour: 6,
      endHour: 7,
      stepMinutes: 15,
    },
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ScheduleTimetable', () => {
  it('emits click-empty with a single-cell range on a simple click without emitting drag-create', async () => {
    const wrapper = mountTimetable()
    const cell = wrapper.get('[data-day="monday"][data-step="0"]')

    await cell.trigger('mousedown', { button: 0 })
    document.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }))
    await cell.trigger('click')

    expect(wrapper.emitted('click-empty')).toEqual([['monday', '06:00', '06:15']])
    expect(wrapper.emitted('drag-create')).toBeUndefined()
  })

  it('emits drag-create and suppresses click-empty after dragging across cells', async () => {
    const wrapper = mountTimetable()
    const startCell = wrapper.get('[data-day="monday"][data-step="0"]')
    const endCell = wrapper.get('[data-day="monday"][data-step="2"]')

    vi.spyOn(document, 'elementFromPoint').mockReturnValue(endCell.element)

    await startCell.trigger('mousedown', { button: 0 })
    document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 10, clientY: 10 }))
    document.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true }))
    await endCell.trigger('click')

    expect(wrapper.emitted('drag-create')).toEqual([['monday', '06:00', '06:45']])
    expect(wrapper.emitted('click-empty')).toBeUndefined()
  })
})
