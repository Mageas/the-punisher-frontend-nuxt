import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ScheduleSlotClassroomPicker from '../ScheduleSlotClassroomPicker.vue'

const translations: Record<string, string> = {
  'schedule.form.classrooms': 'Classes',
  'schedule.form.noClassroomSelected': 'Aucune classe selectionnee',
  'schedule.form.classroomPlaceholder': 'Selectionner les classes...',
  'schedule.form.classroomSearch': 'Rechercher une classe...',
  'schedule.form.classroomEmpty': 'Aucune classe trouvee.',
  'common.actions.remove': 'Retirer',
}

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => translations[key] ?? key,
    te: () => true,
  }),
}))

const stubs = {
  Badge: {
    template: '<span><slot /></span>',
  },
  IdNameSelect: {
    props: ['disabled'],
    emits: ['selected-option'],
    template:
      '<button type="button" data-testid="schedule-slot-add-classroom" @click="$emit(\'selected-option\', { id: \'class-2\', name: \'5B\' })"><slot /></button>',
  },
}

describe('ScheduleSlotClassroomPicker', () => {
  it('shows the empty fallback when no classroom is selected', () => {
    const wrapper = mount(ScheduleSlotClassroomPicker, {
      props: {
        selectedClassrooms: [],
        fetchOptions: vi.fn(),
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Aucune classe selectionnee')
  })

  it('renders selected classrooms and forwards add/remove events', async () => {
    const wrapper = mount(ScheduleSlotClassroomPicker, {
      props: {
        selectedClassrooms: [{ id: 'class-1', name: '6A' }],
        fetchOptions: vi.fn(),
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('6A')

    await wrapper.get('[data-testid="schedule-slot-add-classroom"]').trigger('click')
    await wrapper.get('[data-testid="schedule-slot-remove-classroom-class-1"]').trigger('click')

    expect(wrapper.emitted('add-classroom')).toEqual([[{ id: 'class-2', name: '5B' }]])
    expect(wrapper.emitted('remove-classroom')).toEqual([['class-1']])
  })
})
