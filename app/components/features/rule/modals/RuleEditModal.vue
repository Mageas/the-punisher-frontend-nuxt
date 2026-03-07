<script setup lang="ts">
import { useForm } from 'vee-validate'
import type { Rule } from '~/types/api'
import { buildRuleUpdatePayload, getRuleFormInitialValues, type RuleFormValues } from '~/lib/rule-form'

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  rule: Rule | null
}>()

const { t } = useI18n()
const { globalError, setFormErrors, clearErrors } = useApiErrors()
const { isPending: submitLoading, withPending: withSubmitLoading } = useApiActionState()
const ruleService = useRuleService()
const { notifyUpdateSuccess } = useActionToast()
const schema = useRuleFormSchema()

const { handleSubmit, resetForm, setFieldError, setFieldValue, values, meta } = useForm<RuleFormValues>({
  validationSchema: schema,
  initialValues: getRuleFormInitialValues(props.rule),
})

const { modeOptions, dueAtModeOptions, getInitialValues } = useRuleFormState({
  values,
  setFieldValue,
})
const selectedPenaltyTypeName = ref(props.rule?.penalty_type_name ?? '')
const selectedPunishmentTypeName = ref(props.rule?.resulting_punishment_type_name ?? '')

function syncSelectedTypeNames(rule: Rule | null) {
  selectedPenaltyTypeName.value = rule?.penalty_type_name ?? ''
  selectedPunishmentTypeName.value = rule?.resulting_punishment_type_name ?? ''
}

watch(open, (isOpen) => {
  if (isOpen && props.rule) {
    clearErrors()
    resetForm({
      values: getInitialValues(props.rule),
    })
    syncSelectedTypeNames(props.rule)
  }
})

const onSubmit = handleSubmit(async (formValues) => {
  const rule = props.rule
  if (!rule?.id) return
  clearErrors()
  try {
    const deltaPayload = buildRuleUpdatePayload(rule, formValues)

    if (Object.keys(deltaPayload).length > 0) {
      await withSubmitLoading(async () => {
        await ruleService.updateRule(rule.id, deltaPayload)
        notifyUpdateSuccess()
        emit('updated')
      })
    }

    open.value = false
  } catch (err) {
    setFormErrors(setFieldError, err)
  }
})
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="t('modals.rule.editTitle')"
    :global-error="globalError"
    :submitting="submitLoading"
    :can-submit="meta.valid"
    :submit-text="t('common.actions.save')"
    prevent-auto-focus
    @submit="onSubmit"
  >
    <RuleFormFields
      :due-at-mode="values.due_at_mode"
      :mode-options="modeOptions"
      :due-at-mode-options="dueAtModeOptions"
      :penalty-type-selected-name="selectedPenaltyTypeName"
      :punishment-type-selected-name="selectedPunishmentTypeName"
      @penalty-type-selected="selectedPenaltyTypeName = $event?.name ?? ''"
      @punishment-type-selected="selectedPunishmentTypeName = $event?.name ?? ''"
    />
  </BaseModal>
</template>
