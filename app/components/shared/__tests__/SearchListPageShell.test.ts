import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchListPageShell from '../SearchListPageShell.vue'

describe('SearchListPageShell', () => {
  it('keeps modal content mounted when the list is empty', () => {
    const wrapper = mount(SearchListPageShell, {
      props: {
        title: 'Classes',
        createLabel: 'Ajouter',
        itemsCount: 0,
        emptyMessage: 'Aucune classe',
        page: 1,
        itemsPerPage: 10,
        total: 0,
      },
      slots: {
        default: '<div data-testid="list-content">Liste</div>',
        modals: '<div data-testid="modal-content">Modal</div>',
      },
      global: {
        stubs: {
          Plus: true,
          PageHeaderBar: {
            template:
              '<div><div data-testid="header-left"><slot name="left" /></div><div data-testid="header-actions"><slot name="actions" /></div></div>',
          },
          PageTitleWithCount: {
            props: ['title', 'countLabel'],
            template: '<div data-testid="page-title">{{ title }} {{ countLabel }}</div>',
          },
          Button: {
            template: '<button data-testid="create-button"><slot /></button>',
          },
          FilterBar: {
            template: '<div data-testid="filter-bar"><slot /></div>',
          },
          ListEmptyState: {
            props: ['itemsCount', 'loading', 'message'],
            template:
              '<div v-if="itemsCount === 0 && !loading" data-testid="empty-state">{{ message }}</div>',
          },
          CustomPagination: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="empty-state"]').text()).toContain('Aucune classe')
    expect(wrapper.find('[data-testid="list-content"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="modal-content"]').text()).toBe('Modal')
  })

  it('emits create and shows list content when items exist', async () => {
    const wrapper = mount(SearchListPageShell, {
      props: {
        title: 'Classes',
        createLabel: 'Ajouter',
        itemsCount: 2,
        emptyMessage: 'Aucune classe',
        page: 1,
        itemsPerPage: 10,
        total: 2,
        showPagination: false,
      },
      slots: {
        default: '<div data-testid="list-content">Liste</div>',
      },
      global: {
        stubs: {
          Plus: true,
          PageHeaderBar: {
            template:
              '<div><div data-testid="header-left"><slot name="left" /></div><div data-testid="header-actions"><slot name="actions" /></div></div>',
          },
          PageTitleWithCount: true,
          Button: {
            template: '<button data-testid="create-button"><slot /></button>',
          },
          FilterBar: {
            template: '<div><slot /></div>',
          },
          ListEmptyState: true,
          CustomPagination: true,
        },
      },
    })

    expect(wrapper.get('[data-testid="list-content"]').text()).toBe('Liste')

    await wrapper.get('[data-testid="create-button"]').trigger('click')

    expect(wrapper.emitted('create')).toEqual([[]])
  })
})
