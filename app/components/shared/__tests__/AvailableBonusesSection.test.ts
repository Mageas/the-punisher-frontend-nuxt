import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import AvailableBonusesSection from '../AvailableBonusesSection.vue'

const mockI18n = {
  t: (key: string) =>
    ({
      'studentProfile.availableBonuses': 'Bonus disponibles',
      'studentProfile.empty.availableBonuses': 'Aucun bonus disponible.',
      'common.actions.consume': 'Consommer',
    })[key] ?? key,
}

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

const SectionHeaderRowStub = defineComponent({
  name: 'SectionHeaderRow',
  props: {
    title: { type: String, required: true },
    page: { type: Number, required: false },
    totalPages: { type: Number, required: false },
    loading: { type: Boolean, required: false },
    disabled: { type: Boolean, required: false },
    badgeText: { type: String, required: false },
    badgeHelpText: { type: String, required: false },
  },
  emits: ['update:page'],
  template: '<div data-testid="header" />',
})

const SectionListBlockStub = defineComponent({
  name: 'SectionListBlock',
  props: {
    isEmpty: { type: Boolean, required: true },
    emptyLabel: { type: String, required: true },
    listClass: { type: String, required: false },
  },
  template: '<div data-testid="list"><slot /></div>',
})

const BonusCardStub = defineComponent({
  name: 'BonusCard',
  props: {
    bonusTypeName: { type: String, required: true },
    points: { type: Number, required: true },
    usedAt: { type: String, required: false },
    occurredAt: { type: String, required: false },
    createdAt: { type: String, required: true },
    studentId: { type: String, required: false },
    studentFirstName: { type: String, required: false },
    studentLastName: { type: String, required: false },
  },
  template: '<div data-testid="bonus-card"><slot name="actions" /></div>',
})

const BonusUseModalStub = defineComponent({
  name: 'BonusUseModal',
  props: {
    bonusId: { type: String, required: false },
    useFn: { type: Function, required: true },
  },
  emits: ['confirmed'],
  template: '<div data-testid="use-modal" />',
})

const ButtonStub = defineComponent({
  name: 'Button',
  template: '<button type="button"><slot /></button>',
})

describe('AvailableBonusesSection', () => {
  it('uses shared defaults and re-emits pagination/consume events', async () => {
    const useFn = vi.fn()
    const wrapper = mount(AvailableBonusesSection, {
      props: {
        bonuses: [
          {
            id: 'bonus-1',
            bonus_type_name: 'Participation',
            points: 2,
            created_at: '2026-03-08T10:00:00Z',
            student_id: 'student-1',
            student_first_name: 'Jane',
            student_last_name: 'Doe',
          },
        ],
        useFn,
        showStudentDetails: true,
      },
      global: {
        stubs: {
          SectionHeaderRow: SectionHeaderRowStub,
          SectionListBlock: SectionListBlockStub,
          BonusCard: BonusCardStub,
          BonusUseModal: BonusUseModalStub,
          Button: ButtonStub,
        },
      },
    })

    const header = wrapper.getComponent(SectionHeaderRowStub)
    const list = wrapper.getComponent(SectionListBlockStub)
    const card = wrapper.getComponent(BonusCardStub)
    const modal = wrapper.getComponent(BonusUseModalStub)

    expect(header.props()).toMatchObject({
      title: 'Bonus disponibles',
    })
    expect(list.props()).toMatchObject({
      emptyLabel: 'Aucun bonus disponible.',
      listClass: 'space-y-2',
    })
    expect(card.props()).toMatchObject({
      bonusTypeName: 'Participation',
      points: 2,
      studentId: 'student-1',
      studentFirstName: 'Jane',
      studentLastName: 'Doe',
    })

    header.vm.$emit('update:page', 2)
    modal.vm.$emit('confirmed')

    expect(wrapper.emitted('update:page')).toEqual([[2]])
    expect(wrapper.emitted('used')).toEqual([[]])
  })
})
