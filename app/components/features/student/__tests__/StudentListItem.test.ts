import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentListItem from '../StudentListItem.vue'

const mockI18n = {
  t: (key: string) => (key === 'students.noClassroom' ? 'Aucune classe' : key),
  te: () => true,
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

const stubs = {
  Badge: {
    template: '<span><slot /></span>',
  },
  NuxtLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
}

describe('StudentListItem', () => {
  it('renders the student identity, classrooms and counters', () => {
    const wrapper = mount(StudentListItem, {
      props: {
        student: {
          id: 'student-1',
          first_name: 'Jean',
          last_name: 'Dupont',
          classrooms: [{ id: 'class-1', name: '6A' }],
          available_bonus_points: 3,
          penalty_count: 2,
          created_at: '2026-03-01T00:00:00.000Z',
          updated_at: '2026-03-01T00:00:00.000Z',
        },
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Jean Dupont')
    expect(wrapper.text()).toContain('6A')
    expect(wrapper.text()).toContain('3 pts')
    expect(wrapper.text()).toContain('2')
    expect(wrapper.find('a[href="/students/student-1"]').exists()).toBe(true)
  })

  it('shows the empty classroom fallback', () => {
    const wrapper = mount(StudentListItem, {
      props: {
        student: {
          id: 'student-2',
          first_name: 'Lina',
          last_name: 'Martin',
          classrooms: [],
          available_bonus_points: 1,
          penalty_count: 0,
          created_at: '2026-03-01T00:00:00.000Z',
          updated_at: '2026-03-01T00:00:00.000Z',
        },
      },
      global: {
        stubs,
      },
    })

    expect(wrapper.text()).toContain('Aucune classe')
  })
})
