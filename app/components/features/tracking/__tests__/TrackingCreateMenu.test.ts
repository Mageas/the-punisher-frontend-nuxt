import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TrackingCreateMenu from '../TrackingCreateMenu.vue'

describe('TrackingCreateMenu', () => {
  it('renders the three tracking create actions and forwards clicks', async () => {
    const wrapper = mount(TrackingCreateMenu, {
      props: {
        createLabel: 'Ajouter',
        addBonusLabel: 'Ajouter un bonus',
        addPenaltyLabel: 'Ajouter une penalite',
        addPunishmentLabel: 'Ajouter une punition',
      },
      global: {
        stubs: {
          PageActionsMenu: {
            props: ['createLabel', 'align'],
            template:
              '<div data-testid="page-actions-menu"><slot name="create" /></div>',
          },
          DropdownMenuItem: {
            template: '<button type="button"><slot /></button>',
          },
        },
      },
    })

    const buttons = wrapper.findAll('button')

    expect(wrapper.text()).toContain('Ajouter un bonus')
    expect(wrapper.text()).toContain('Ajouter une penalite')
    expect(wrapper.text()).toContain('Ajouter une punition')
    expect(buttons).toHaveLength(3)

    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')
    await buttons[2]!.trigger('click')

    expect(wrapper.emitted('create-bonus')).toEqual([[]])
    expect(wrapper.emitted('create-penalty')).toEqual([[]])
    expect(wrapper.emitted('create-punishment')).toEqual([[]])
  })

  it('forwards the optional manage slot', () => {
    const wrapper = mount(TrackingCreateMenu, {
      props: {
        createLabel: 'Ajouter',
        addBonusLabel: 'Ajouter un bonus',
        addPenaltyLabel: 'Ajouter une penalite',
        addPunishmentLabel: 'Ajouter une punition',
      },
      slots: {
        manage: '<div data-testid="manage-slot">Gerer</div>',
      },
      global: {
        stubs: {
          PageActionsMenu: {
            props: ['createLabel', 'align'],
            template:
              '<div><slot name="create" /><slot name="manage" /></div>',
          },
          DropdownMenuItem: {
            template: '<button type="button"><slot /></button>',
          },
        },
      },
    })

    expect(wrapper.get('[data-testid="manage-slot"]').text()).toBe('Gerer')
  })
})
