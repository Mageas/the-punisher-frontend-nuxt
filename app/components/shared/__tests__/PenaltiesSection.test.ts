import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import PenaltiesSection from '../PenaltiesSection.vue'

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

const PenaltyCardStub = defineComponent({
  name: 'PenaltyCard',
  props: {
    penaltyTypeName: { type: String, required: true },
    occurredAt: { type: String, required: false },
    createdAt: { type: String, required: true },
    studentId: { type: String, required: false },
    studentFirstName: { type: String, required: false },
    studentLastName: { type: String, required: false },
  },
  template: '<div data-testid="penalty-card" />',
})

describe('PenaltiesSection', () => {
  it('forwards shared penalty props and pagination events', async () => {
    const wrapper = mount(PenaltiesSection, {
      props: {
        penalties: [
          {
            id: 'penalty-1',
            penalty_type_name: 'Retard',
            created_at: '2026-03-08T10:00:00Z',
            student_id: 'student-1',
            student_first_name: 'Jane',
            student_last_name: 'Doe',
          },
        ],
        title: 'Dernières pénalités',
        emptyLabel: 'Aucune pénalité',
        listClass: 'space-y-3',
        showStudentDetails: true,
      },
      global: {
        stubs: {
          SectionHeaderRow: SectionHeaderRowStub,
          SectionListBlock: SectionListBlockStub,
          PenaltyCard: PenaltyCardStub,
        },
      },
    })

    const header = wrapper.getComponent(SectionHeaderRowStub)
    const list = wrapper.getComponent(SectionListBlockStub)
    const card = wrapper.getComponent(PenaltyCardStub)

    expect(header.props()).toMatchObject({
      title: 'Dernières pénalités',
    })
    expect(list.props()).toMatchObject({
      emptyLabel: 'Aucune pénalité',
      listClass: 'space-y-3',
    })
    expect(card.props()).toMatchObject({
      penaltyTypeName: 'Retard',
      studentId: 'student-1',
      studentFirstName: 'Jane',
      studentLastName: 'Doe',
    })

    header.vm.$emit('update:page', 2)

    expect(wrapper.emitted('update:page')).toEqual([[2]])
  })
})
