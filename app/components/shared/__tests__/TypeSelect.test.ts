import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import TypeSelect from '../TypeSelect.vue'

const mockI18n = {
  t: (key: string) =>
    ({
      'common.placeholders.selectType': 'Selectionner un type',
      'common.empty.noTypeFound': 'Aucun type trouve',
    })[key] ?? key,
}

const FilterIdNameSelectStub = defineComponent({
  name: 'FilterIdNameSelect',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    fetchOptions: { type: Function, default: undefined },
    selectedLabel: { type: String, default: undefined },
    placeholder: { type: String, required: true },
    searchPlaceholder: { type: String, default: undefined },
    emptyText: { type: String, required: true },
    label: { type: String, default: undefined },
  },
  emits: ['update:modelValue', 'selectedOption'],
  template: '<div data-testid="filter-id-name-select" />',
})

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

describe('TypeSelect', () => {
  it('uses default translations and forwards attrs', () => {
    const wrapper = mount(TypeSelect, {
      props: {
        options: [{ id: 'bonus-type-1', name: 'Participation' }],
      },
      attrs: {
        label: 'Type',
      },
      global: {
        stubs: {
          FilterIdNameSelect: FilterIdNameSelectStub,
        },
      },
    })

    const select = wrapper.getComponent(FilterIdNameSelectStub)

    expect(select.props('placeholder')).toBe('Selectionner un type')
    expect(select.props('emptyText')).toBe('Aucun type trouve')
    expect(select.props('label')).toBe('Type')
  })

  it('forwards overrides and re-emits the selected option', async () => {
    const fetchOptions = vi.fn()
    const wrapper = mount(TypeSelect, {
      props: {
        fetchOptions,
        placeholder: 'Tous les types',
        searchPlaceholder: 'Chercher un type',
        emptyText: 'Aucun resultat',
        selectedName: 'Participation',
      },
      global: {
        stubs: {
          FilterIdNameSelect: FilterIdNameSelectStub,
        },
      },
    })

    const select = wrapper.getComponent(FilterIdNameSelectStub)

    expect(select.props()).toMatchObject({
      fetchOptions,
      placeholder: 'Tous les types',
      searchPlaceholder: 'Chercher un type',
      emptyText: 'Aucun resultat',
      selectedLabel: 'Participation',
    })

    select.vm.$emit('selectedOption', { id: 'bonus-type-1', name: 'Participation' })
    await select.vm.$emit('update:modelValue', 'bonus-type-1')

    expect(wrapper.emitted('selectedOption')).toEqual([
      [{ id: 'bonus-type-1', name: 'Participation' }],
    ])
    expect(wrapper.emitted('update:modelValue')).toEqual([['bonus-type-1']])
  })
})
