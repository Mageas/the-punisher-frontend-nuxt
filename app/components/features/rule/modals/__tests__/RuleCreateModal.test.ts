import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import RuleCreateModal from '../RuleCreateModal.vue'

const mockRuleService = {
  createRule: vi.fn(),
}

const mockApiErrors = {
  globalError: ref(null),
  setFormErrors: vi.fn(),
  clearErrors: vi.fn(),
}

const translations: Record<string, string> = {
  'modals.rule.title': 'Nouvelle règle',
  'common.actions.create': 'Créer',
  'modals.rule.name': 'Nom de la règle (optionnel)',
  'modals.rule.namePlaceholder': 'Laisser vide pour générer automatiquement',
  'modals.rule.penaltyType': 'Déclencheur',
  'modals.rule.punishmentType': 'Conséquence',
  'common.labels.threshold': 'Seuil',
  'modals.rule.triggerMode': 'Mode de déclenchement',
  'modals.rule.dueAtMode': 'Mode d\u2019échéance',
  'modals.rule.dueAtAfterDays': 'Délai',
  'modals.rule.dueAtAfterLessons': 'Nombre de prochains cours',
  'common.placeholders.selectType': 'Sélectionner un type...',
  'common.empty.noTypeFound': 'Aucun type trouvé.',
  'rules.modes.at': 'Au seuil exact',
  'rules.modes.every': 'À chaque multiple',
  'rules.modes.after': 'À partir de',
  'rules.dueModes.days': 'Jours',
  'rules.dueModes.next_lessons': 'Prochains cours',
  'rules.defaultName': 'Règle automatique',
  'apiErrors.details.validation_field_required': 'Champ requis',
  'apiErrors.details.validation_min_length': 'Longueur minimale',
  'apiErrors.details.validation_max_length': 'Longueur maximale',
}

const mockI18n = {
  t: (key: string) => translations[key] ?? key,
  te: () => true,
}

let mockFormValues: Record<string, unknown> = {
  name: '',
  penalty_type_id: 'penalty-1',
  resulting_punishment_type_id: 'punishment-1',
  threshold: 3,
  mode: 'at',
  due_at_mode: 'days',
  due_at_after_days: 7,
  due_at_after_lessons: null,
}

vi.mock('~/composables/services/useRuleService', () => ({
  useRuleService: () => mockRuleService,
}))

vi.mock('~/composables/useApiErrors', () => ({
  useApiErrors: () => mockApiErrors,
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => mockI18n,
}))

vi.mock('vee-validate', async () => {
  const original = (await vi.importActual('vee-validate')) as Record<string, unknown>
  return {
    ...original,
    useForm: () => {
      const values = reactive({ ...mockFormValues })

      return {
        handleSubmit:
          (fn: (formValues: Record<string, unknown>) => Promise<unknown>) => async () => {
            await fn({ ...values })
          },
        isSubmitting: ref(false),
        resetForm: vi.fn((payload?: { values?: Record<string, unknown> }) => {
          if (!payload?.values) return
          Object.assign(values, payload.values)
        }),
        setFieldError: vi.fn(),
        setFieldValue: vi.fn((field: string, value: unknown) => {
          values[field] = value
        }),
        values,
        meta: reactive({ valid: true }),
      }
    },
  }
})

const stubs = {
  BaseModal: {
    template:
      '<div><slot /><button id="submit-btn" @click="$emit(\'submit\')">Submit</button></div>',
    props: ['open', 'title', 'globalError', 'submitting', 'canSubmit', 'submitText'],
  },
  FormField: {
    template:
      '<div><slot :value="\'\'" :handleChange="() => {}" :componentField="{ modelValue: \'\', \'onUpdate:modelValue\': () => {} }" /></div>',
  },
  FormItem: {
    template: '<div><slot /></div>',
  },
  FormLabel: {
    template: '<label><slot /></label>',
  },
  FormControl: {
    template: '<div><slot /></div>',
  },
  Input: {
    template: '<input />',
  },
  FilterIdNameSelect: {
    template: '<div />',
  },
  PenaltyTypeSelect: {
    template:
      '<button data-testid="penalty-select" @click="$emit(`selected-option`, { id: `penalty-1`, name: `Retard` })">Penalty</button>',
  },
  PunishmentTypeSelect: {
    template:
      '<button data-testid="punishment-select" @click="$emit(`selected-option`, { id: `punishment-1`, name: `Retenue` })">Punishment</button>',
  },
  FormMessage: {
    template: '<span><slot /></span>',
  },
}

describe('RuleCreateModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiErrors.globalError.value = null
  })

  it('uses generated from->to name when custom name is empty', async () => {
    mockFormValues = {
      name: '   ',
      penalty_type_id: 'penalty-1',
      resulting_punishment_type_id: 'punishment-1',
      threshold: 3,
      mode: 'at',
      due_at_mode: 'days',
      due_at_after_days: 7,
      due_at_after_lessons: null,
    }
    mockRuleService.createRule.mockResolvedValue({ id: 'rule-1' })

    const wrapper = mount(RuleCreateModal, {
      props: {
        open: true,
      },
      global: {
        stubs,
      },
    })

    await wrapper.get('[data-testid="penalty-select"]').trigger('click')
    await wrapper.get('[data-testid="punishment-select"]').trigger('click')
    await wrapper.get('#submit-btn').trigger('click')

    expect(mockRuleService.createRule).toHaveBeenCalledWith({
      penalty_type_id: 'penalty-1',
      resulting_punishment_type_id: 'punishment-1',
      threshold: 3,
      mode: 'at',
      due_at_mode: 'days',
      due_at_after_days: 7,
      due_at_after_lessons: null,
      name: 'Retard -> Retenue',
      is_active: true,
    })
  })

  it('uses the custom rule name when provided', async () => {
    mockFormValues = {
      name: 'Règle personnalisée',
      penalty_type_id: 'penalty-1',
      resulting_punishment_type_id: 'punishment-1',
      threshold: 3,
      mode: 'at',
      due_at_mode: 'days',
      due_at_after_days: 7,
      due_at_after_lessons: null,
    }
    mockRuleService.createRule.mockResolvedValue({ id: 'rule-2' })

    const wrapper = mount(RuleCreateModal, {
      props: {
        open: true,
      },
      global: {
        stubs,
      },
    })

    await wrapper.get('#submit-btn').trigger('click')

    expect(mockRuleService.createRule).toHaveBeenCalledWith({
      penalty_type_id: 'penalty-1',
      resulting_punishment_type_id: 'punishment-1',
      threshold: 3,
      mode: 'at',
      due_at_mode: 'days',
      due_at_after_days: 7,
      due_at_after_lessons: null,
      name: 'Règle personnalisée',
      is_active: true,
    })
    expect(wrapper.emitted()).toHaveProperty('created')
  })

  it('sends the next_lessons payload and nulls due_at_after_days', async () => {
    mockFormValues = {
      name: 'Au prochain cours',
      penalty_type_id: 'penalty-1',
      resulting_punishment_type_id: 'punishment-1',
      threshold: 3,
      mode: 'every',
      due_at_mode: 'next_lessons',
      due_at_after_days: null,
      due_at_after_lessons: 2,
    }
    mockRuleService.createRule.mockResolvedValue({ id: 'rule-3' })

    const wrapper = mount(RuleCreateModal, {
      props: {
        open: true,
      },
      global: {
        stubs,
      },
    })

    await wrapper.get('#submit-btn').trigger('click')

    expect(mockRuleService.createRule).toHaveBeenCalledWith({
      penalty_type_id: 'penalty-1',
      resulting_punishment_type_id: 'punishment-1',
      threshold: 3,
      mode: 'every',
      due_at_mode: 'next_lessons',
      due_at_after_days: null,
      due_at_after_lessons: 2,
      name: 'Au prochain cours',
      is_active: true,
    })
  })
})
