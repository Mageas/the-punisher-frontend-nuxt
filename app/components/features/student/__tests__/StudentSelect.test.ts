import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import StudentSelect from '../StudentSelect.vue'

const fetchTrackedStudentOptions = vi.fn()

vi.mock('~/composables/useTrackedEntityFilterOptions', () => ({
  toStudentOption: (student: { id: string; first_name: string; last_name: string }) => ({
    id: student.id,
    name: `${student.first_name} ${student.last_name}`,
  }),
  useTrackedEntityFilterOptions: () => ({
    fetchStudentOptions: fetchTrackedStudentOptions,
  }),
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    te: () => true,
  }),
}))

const EntityRemoteSelectStub = defineComponent({
  name: 'EntityRemoteSelect',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    fetchOptions: { type: Function, default: undefined },
    optionsScopeKey: { type: [String, Number, Boolean], default: null },
    selectedName: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    searchPlaceholder: { type: String, default: undefined },
    emptyText: { type: String, default: undefined },
    keepFocusOnSelect: { type: Boolean, default: false },
    fullWidth: { type: Boolean, default: true },
    wrapperClass: { type: String, default: undefined },
  },
  emits: ['update:modelValue', 'selectedOption'],
  template: '<div data-testid="entity-remote-select" />',
})

describe('StudentSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the next remote page when the current page only contains excluded students', async () => {
    fetchTrackedStudentOptions
      .mockResolvedValueOnce({
        page: 1,
        item_per_page: 10,
        total_count: 20,
        previous_page: null,
        next_page: 2,
        data: [{ id: 'student-1', name: 'Jean Dupont' }],
      })
      .mockResolvedValueOnce({
        page: 2,
        item_per_page: 10,
        total_count: 20,
        previous_page: 1,
        next_page: null,
        data: [{ id: 'student-2', name: 'Lina Martin' }],
      })

    const wrapper = mount(StudentSelect, {
      props: {
        excludeIds: ['student-1'],
      },
      global: {
        stubs: {
          EntityRemoteSelect: EntityRemoteSelectStub,
        },
      },
    })

    const select = wrapper.getComponent(EntityRemoteSelectStub)
    const fetchOptions = select.props('fetchOptions') as
      | ((options: { page: number; search?: string }) => Promise<unknown>)
      | undefined

    expect(fetchOptions).toBeTypeOf('function')

    const response = await fetchOptions?.({ page: 1 })

    expect(fetchTrackedStudentOptions).toHaveBeenNthCalledWith(1, { page: 1 })
    expect(fetchTrackedStudentOptions).toHaveBeenNthCalledWith(2, { page: 2 })
    expect(response).toMatchObject({
      page: 2,
      next_page: null,
      data: [{ id: 'student-2', name: 'Lina Martin' }],
    })
  })
})
