<script setup lang="ts">
import { useForm } from 'vee-validate'
import {
  buildRulePayload,
  getGeneratedRuleName,
  getRuleFormInitialValues,
  type RuleFormValues,
  resolveRuleFormName,
} from '~/lib/rule-form'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const { isPending: submitLoading, withPending: withSubmitLoading } = useApiActionState()
const ruleService = useRuleService()
const { notifyCreateSuccess } = useActionToast()
const schema = useRuleFormSchema({ allowEmptyName: true })

const { handleSubmit, resetForm, setFieldError, setFieldValue, values, meta } = useForm<RuleFormValues>({
  validationSchema: schema,
  initialValues: getRuleFormInitialValues(),
})

const { modeOptions, dueAtModeOptions, getInitialValues } = useRuleFormState({
  values,
  setFieldValue,
})
const selectedPenaltyTypeName = ref('')
const selectedPunishmentTypeName = ref('')

const generatedRuleName = computed(() => {
  return getGeneratedRuleName(
    selectedPenaltyTypeName.value,
    selectedPunishmentTypeName.value,
    t('rules.defaultName'),
  )
})

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    resetForm({
      values: getInitialValues(),
    })
    selectedPenaltyTypeName.value = ''
    selectedPunishmentTypeName.value = ''
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  clearErrors()
  try {
    const resolvedName = resolveRuleFormName(formValues.name, generatedRuleName.value)

    await withSubmitLoading(async () => {
      await ruleService.createRule(buildRulePayload({ ...formValues, name: resolvedName }, true))
      notifyCreateSuccess()
      open.value = false
      emit('created')
    })
  } catch (err) {
    setFormErrors(setFieldError, err)
  }
})
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="t('modals.rule.title')"
    :global-error="globalError"
    :submitting="submitLoading"
    :can-submit="meta.valid"
    :submit-text="t('common.actions.create')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <RuleFormFields
      :name-label="t('modals.rule.name')"
      :name-placeholder="t('modals.rule.namePlaceholder')"
      :due-at-mode="values.due_at_mode"
      :mode-options="modeOptions"
      :due-at-mode-options="dueAtModeOptions"
      @penalty-type-selected="selectedPenaltyTypeName = $event?.name ?? ''"
      @punishment-type-selected="selectedPunishmentTypeName = $event?.name ?? ''"
    />
  </BaseModal>
</template>
