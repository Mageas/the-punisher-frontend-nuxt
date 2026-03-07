import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ScheduleExceptionSelectionBar from '../ScheduleExceptionSelectionBar.vue'

const translations: Record<string, string | ((count?: number) => string)> = {
  'schedule.exceptions.editing': 'Modification',
  'schedule.exceptions.selectedRange': 'Plage selectionnee',
  'schedule.exceptions.editingHint': 'Cliquez deux dates pour redefinir la plage.',
  'schedule.exceptions.cancelSelection': 'Annuler',
  'schedule.exceptions.dayCount': (count) => `${count} jours`,
  'schedule.exceptions.addAsVacation': 'Vacances',
  'schedule.exceptions.addAsHoliday': 'Jour ferie',
}

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, value?: number) => {
      const translation = translations[key]
      if (typeof translation === 'function') return translation(value)
      return translation ?? key
    },
    te: () => true,
  }),
}))

const stubs = {
  Teleport: true,
  Transition: false,
  Button: {
    template: '<button type="button"><slot /></button>',
  },
}

describe('ScheduleExceptionSelectionBar', () => {
  it('renders the selected range, editing hint and action buttons', async () => {
    const wrapper = mount(ScheduleExceptionSelectionBar, {
      props: {
        open: true,
        isEditing: true,
        hasCompleteSelection: true,
        startLabel: '7 mars 2026',
        endLabel: '9 mars 2026',
        dayCount: 3,
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.get('[data-testid="schedule-exception-selection-bar"]').text()).toContain(
      'Modification',
    )
    expect(wrapper.text()).toContain('7 mars 2026')
    expect(wrapper.text()).toContain('9 mars 2026')
    expect(wrapper.text()).toContain('3 jours')

    await wrapper.get('[data-testid="schedule-exception-selection-bar-close"]').trigger('click')
    await wrapper.get('[data-testid="schedule-exception-save-vacation"]').trigger('click')
    await wrapper.get('[data-testid="schedule-exception-save-holiday"]').trigger('click')

    expect(wrapper.emitted('close')).toEqual([[]])
    expect(wrapper.emitted('save-vacation')).toEqual([[]])
    expect(wrapper.emitted('save-holiday')).toEqual([[]])
  })

  it('hides the action buttons when the selection is incomplete', () => {
    const wrapper = mount(ScheduleExceptionSelectionBar, {
      props: {
        open: true,
        startLabel: '7 mars 2026',
        hasCompleteSelection: false,
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.find('[data-testid="schedule-exception-save-vacation"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="schedule-exception-save-holiday"]').exists()).toBe(false)
  })
})
