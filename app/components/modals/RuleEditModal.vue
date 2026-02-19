<script setup lang="ts">
import type { Rule, RuleMode } from '~/types/api'

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  rule: Rule | null
}>()

const { t } = useI18n()
const { $api } = useNuxtApp()
const { fieldErrors, globalError, handleApiError, clearErrors } = useApiErrors()
const { penaltyTypes, fetchPenaltyTypes } = useAllPenaltyTypes()
const { punishmentTypes, fetchPunishmentTypes } = useAllPunishmentTypes()

const selectedPenaltyTypeId = ref('')
const selectedPunishmentTypeId = ref('')
const threshold = ref<number>(1)
const mode = ref<RuleMode>('at')
const dueAtAfterDays = ref<number>(1)
const submitting = ref(false)

const canSubmit = computed(() =>
  !!props.rule?.id
  && selectedPenaltyTypeId.value
  && selectedPunishmentTypeId.value
  && Number.isFinite(threshold.value)
  && Number.isFinite(dueAtAfterDays.value)
  && threshold.value > 0
  && dueAtAfterDays.value > 0,
)

watch(open, async (isOpen) => {
  if (!isOpen || !props.rule) return

  clearErrors()
  selectedPenaltyTypeId.value = props.rule.penalty_type_id
  selectedPunishmentTypeId.value = props.rule.resulting_punishment_type_id
  threshold.value = props.rule.threshold
  mode.value = props.rule.mode
  dueAtAfterDays.value = props.rule.due_at_after_days

  await Promise.all([
    fetchPenaltyTypes(),
    fetchPunishmentTypes(),
  ])
})

async function submit() {
  if (!props.rule?.id || !canSubmit.value) return

  submitting.value = true
  clearErrors()

  try {
    await $api(`/rules/${props.rule.id}`, {
      method: 'PUT',
      body: {
        name: props.rule.name,
        resulting_punishment_type_id: selectedPunishmentTypeId.value,
        penalty_type_id: selectedPenaltyTypeId.value,
        threshold: Math.trunc(threshold.value),
        due_at_after_days: Math.trunc(dueAtAfterDays.value),
        mode: mode.value,
        is_active: props.rule.is_active,
      },
    })
    open.value = false
    emit('updated')
  }
  catch (err) {
    handleApiError(err)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="min-w-0 overflow-visible sm:max-w-md" @open-auto-focus.prevent>
      <DialogHeader>
        <DialogTitle>{{ t('modals.rule.editTitle') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.rule.editTitle') }}</DialogDescription>
      </DialogHeader>

      <form class="min-w-0 space-y-4" @submit.prevent="submit">
        <Alert v-if="globalError" variant="destructive">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <div class="space-y-2">
          <Label>{{ t('modals.rule.penaltyType') }}</Label>
          <PenaltyTypeSelect
            v-model="selectedPenaltyTypeId"
            :penalty-types="penaltyTypes"
            :placeholder="t('modals.rule.selectPenaltyType')"
            :empty-text="t('modals.rule.noPenaltyTypeFound')"
          />
          <p v-if="fieldErrors.penalty_type_id" class="text-sm text-destructive">
            {{ fieldErrors.penalty_type_id }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="space-y-2">
            <Label>{{ t('modals.rule.threshold') }}</Label>
            <Input v-model.number="threshold" type="number" min="1" />
            <p v-if="fieldErrors.threshold" class="text-sm text-destructive">
              {{ fieldErrors.threshold }}
            </p>
          </div>

          <div class="space-y-2">
            <Label>{{ t('modals.rule.mode') }}</Label>
            <NativeSelect v-model="mode" class="w-full">
              <option value="at">{{ t('rules.modes.at') }}</option>
              <option value="every">{{ t('rules.modes.every') }}</option>
              <option value="after">{{ t('rules.modes.after') }}</option>
            </NativeSelect>
            <p v-if="fieldErrors.mode" class="text-sm text-destructive">
              {{ fieldErrors.mode }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <Label>{{ t('modals.rule.punishmentType') }}</Label>
          <PunishmentTypeSelect
            v-model="selectedPunishmentTypeId"
            :punishment-types="punishmentTypes"
            :placeholder="t('modals.rule.selectPunishmentType')"
            :empty-text="t('modals.rule.noPunishmentTypeFound')"
          />
          <p v-if="fieldErrors.resulting_punishment_type_id" class="text-sm text-destructive">
            {{ fieldErrors.resulting_punishment_type_id }}
          </p>
        </div>

        <div class="space-y-2">
          <Label>{{ t('modals.rule.dueAtAfterDays') }}</Label>
          <Input v-model.number="dueAtAfterDays" type="number" min="1" />
          <p v-if="fieldErrors.due_at_after_days" class="text-sm text-destructive">
            {{ fieldErrors.due_at_after_days }}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
            {{ t('modals.rule.cancel') }}
          </Button>
          <Button type="submit" class="cursor-pointer" :disabled="submitting || !canSubmit">
            {{ t('modals.rule.save') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
