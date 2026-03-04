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
  'modals.rule.create': 'Créer',
  'modals.rule.name': 'Nom de la règle (optionnel)',
  'modals.rule.namePlaceholder': 'Laisser vide pour générer automatiquement',
  'modals.rule.penaltyType': 'Déclencheur',
  'modals.rule.punishmentType': 'Conséquence',
  'modals.rule.threshold': 'Seuil',
  'modals.rule.mode': 'Mode',
  'modals.rule.dueAtAfterDays': 'Délai',
  'modals.rule.selectPenaltyType': 'Sélectionner un type...',
  'modals.rule.selectPunishmentType': 'Sélectionner un type...',
  'modals.rule.noPenaltyTypeFound': 'Aucun type trouvé.',
  'modals.rule.noPunishmentTypeFound': 'Aucun type trouvé.',
  'rules.modes.at': 'Au seuil exact',
  'rules.modes.every': 'À chaque multiple',
  'rules.modes.after': 'À partir de',
  'rules.defaultName': 'Règle automatique',
  'filters.noTypeFound': 'Aucun type trouvé.',
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
  due_at_after_days: 7,
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
    useForm: () => ({
      handleSubmit: (fn: (values: Record<string, unknown>) => Promise<unknown>) => async () => {
        await fn(mockFormValues)
      },
      isSubmitting: ref(false),
      resetForm: vi.fn(),
      setFieldError: vi.fn(),
      meta: reactive({ valid: true }),
    }),
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
      "<button data-testid=\"penalty-select\" @click=\"$emit('selected-option', { id: 'penalty-1', name: 'Retard' })\">Penalty</button>",
  },
  PunishmentTypeSelect: {
    template:
      "<button data-testid=\"punishment-select\" @click=\"$emit('selected-option', { id: 'punishment-1', name: 'Retenue' })\">Punishment</button>",
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
      due_at_after_days: 7,
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
      due_at_after_days: 7,
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
      due_at_after_days: 7,
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
      due_at_after_days: 7,
      name: 'Règle personnalisée',
      is_active: true,
    })
    expect(wrapper.emitted()).toHaveProperty('created')
  })
})
