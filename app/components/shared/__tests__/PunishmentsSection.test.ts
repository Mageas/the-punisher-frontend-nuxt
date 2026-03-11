import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import PunishmentsSection from '../PunishmentsSection.vue'

const mockI18n = {
  t: (key: string) =>
    ({
      'common.titles.punishments': 'Punitions',
      'common.empty.noPunishments': 'Aucune punition trouvée.',
      'common.actions.resolve': 'Résoudre',
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

const PunishmentCardStub = defineComponent({
  name: 'PunishmentCard',
  props: {
    punishmentTypeName: { type: String, required: true },
    automated: { type: Boolean, required: true },
    triggeringRuleId: { type: String, required: false },
    triggeringRuleName: { type: String, required: false },
    dueAt: { type: String, required: false },
    studentId: { type: String, required: false },
    studentFirstName: { type: String, required: false },
    studentLastName: { type: String, required: false },
    compact: { type: Boolean, required: false },
  },
  template: '<div data-testid="punishment-card"><slot name="actions" /></div>',
})

const PunishmentResolveModalStub = defineComponent({
  name: 'PunishmentResolveModal',
  props: {
    punishmentId: { type: String, required: false },
    resolveFn: { type: Function, required: true },
  },
  emits: ['confirmed'],
  template: '<div data-testid="resolve-modal" />',
})

const ButtonStub = defineComponent({
  name: 'Button',
  template: '<button type="button"><slot /></button>',
})

describe('PunishmentsSection', () => {
  it('uses generic defaults and re-emits resolve/pagination events', async () => {
    const resolveFn = vi.fn()
    const wrapper = mount(PunishmentsSection, {
      props: {
        punishments: [
          {
            id: 'punishment-1',
            punishment_type_name: 'Retenue',
            automated: true,
            student_id: 'student-1',
            student_first_name: 'Jane',
            student_last_name: 'Doe',
          },
        ],
        showCount: true,
        badgeText: '1 / 4',
        compact: true,
        resolveFn,
      },
      global: {
        stubs: {
          SectionHeaderRow: SectionHeaderRowStub,
          SectionListBlock: SectionListBlockStub,
          PunishmentCard: PunishmentCardStub,
          PunishmentResolveModal: PunishmentResolveModalStub,
          Button: ButtonStub,
        },
      },
    })

    const header = wrapper.getComponent(SectionHeaderRowStub)
    const list = wrapper.getComponent(SectionListBlockStub)
    const card = wrapper.getComponent(PunishmentCardStub)
    const modal = wrapper.getComponent(PunishmentResolveModalStub)

    expect(header.props()).toMatchObject({
      title: 'Punitions',
      badgeText: '1 / 4',
    })
    expect(list.props()).toMatchObject({
      emptyLabel: 'Aucune punition trouvée.',
      listClass: 'space-y-2',
    })
    expect(card.props()).toMatchObject({
      punishmentTypeName: 'Retenue',
      automated: true,
      studentId: 'student-1',
      studentFirstName: 'Jane',
      studentLastName: 'Doe',
      compact: true,
    })

    header.vm.$emit('update:page', 2)
    modal.vm.$emit('confirmed')

    expect(wrapper.emitted('update:page')).toEqual([[2]])
    expect(wrapper.emitted('resolved')).toEqual([[]])
  })

  it('does not render a resolve action for already resolved punishments', () => {
    const wrapper = mount(PunishmentsSection, {
      props: {
        punishments: [
          {
            id: 'punishment-1',
            punishment_type_name: 'Retenue',
            automated: true,
            resolved_at: '2026-03-09T10:00:00Z',
          },
        ],
        resolveFn: vi.fn(),
      },
      global: {
        stubs: {
          SectionHeaderRow: SectionHeaderRowStub,
          SectionListBlock: SectionListBlockStub,
          PunishmentCard: PunishmentCardStub,
          PunishmentResolveModal: PunishmentResolveModalStub,
          Button: ButtonStub,
        },
      },
    })

    expect(wrapper.findComponent(ButtonStub).exists()).toBe(false)
  })
})
