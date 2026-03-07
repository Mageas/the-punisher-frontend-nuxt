import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import EntityRemoteSelect from '../EntityRemoteSelect.vue'

const FilterIdNameSelectStub = defineComponent({
  name: 'FilterIdNameSelect',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    fetchOptions: { type: Function, default: undefined },
    optionsScopeKey: { type: [String, Number, Boolean], default: null },
    selectedLabel: { type: String, default: undefined },
    placeholder: { type: String, required: true },
    searchPlaceholder: { type: String, default: undefined },
    emptyText: { type: String, required: true },
    keepFocusOnSelect: { type: Boolean, default: false },
    fullWidth: { type: Boolean, default: true },
    noneOptionLabel: { type: String, default: undefined },
    noneValueLabel: { type: String, default: undefined },
    label: { type: String, default: undefined },
  },
  emits: ['update:modelValue', 'selectedOption'],
  template: '<div data-testid="filter-id-name-select" />',
})

describe('EntityRemoteSelect', () => {
  it('wraps the select when requested and forwards all selection props', async () => {
    const fetchOptions = async () => ({
      page: 1,
      item_per_page: 10,
      total_count: 1,
      previous_page: null,
      next_page: null,
      data: [{ id: 'class-1', name: '6A' }],
    })

    const wrapper = mount(EntityRemoteSelect, {
      props: {
        options: [{ id: 'class-1', name: '6A' }],
        fetchOptions,
        optionsScopeKey: 'classrooms',
        placeholder: 'Choisir une classe',
        searchPlaceholder: 'Chercher une classe',
        emptyText: 'Aucune classe',
        selectedName: '6A',
        keepFocusOnSelect: true,
        fullWidth: false,
        noneOptionLabel: 'Toutes les classes',
        noneValueLabel: 'Toutes les classes',
        wrapperClass: 'w-full md:w-[200px]',
      },
      attrs: {
        label: 'Classe',
      },
      global: {
        stubs: {
          FilterIdNameSelect: FilterIdNameSelectStub,
        },
      },
    })

    const select = wrapper.getComponent(FilterIdNameSelectStub)

    expect(wrapper.html()).toContain('w-full')
    expect(select.props()).toMatchObject({
      options: [{ id: 'class-1', name: '6A' }],
      fetchOptions,
      optionsScopeKey: 'classrooms',
      placeholder: 'Choisir une classe',
      searchPlaceholder: 'Chercher une classe',
      emptyText: 'Aucune classe',
      selectedLabel: '6A',
      keepFocusOnSelect: true,
      fullWidth: false,
      noneOptionLabel: 'Toutes les classes',
      noneValueLabel: 'Toutes les classes',
      label: 'Classe',
    })

    select.vm.$emit('selectedOption', { id: 'class-1', name: '6A' })
    await select.vm.$emit('update:modelValue', 'class-1')

    expect(wrapper.emitted('selectedOption')).toEqual([[{ id: 'class-1', name: '6A' }]])
    expect(wrapper.emitted('update:modelValue')).toEqual([['class-1']])
  })
})
