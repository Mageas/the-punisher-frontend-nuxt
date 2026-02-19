<script setup lang="ts">
import type { RuleMode } from '~/types/api'

const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { $api } = useNuxtApp()
const { fieldErrors, globalError, handleApiError, clearErrors } = useApiErrors()
const { penaltyTypes, fetchPenaltyTypes } = useAllPenaltyTypes()
const { punishmentTypes, fetchPunishmentTypes } = useAllPunishmentTypes()

const selectedPenaltyTypeId = ref('')
const selectedPunishmentTypeId = ref('')
const threshold = ref<number>(3)
const mode = ref<RuleMode>('at')
const dueAtAfterDays = ref<number>(7)
const submitting = ref(false)

const canSubmit = computed(() =>
  selectedPenaltyTypeId.value
  && selectedPunishmentTypeId.value
  && Number.isFinite(threshold.value)
  && Number.isFinite(dueAtAfterDays.value)
  && threshold.value > 0
  && dueAtAfterDays.value > 0,
)

const selectedPenaltyTypeName = computed(() =>
  penaltyTypes.value.find(type => type.id === selectedPenaltyTypeId.value)?.name ?? '',
)

const selectedPunishmentTypeName = computed(() =>
  punishmentTypes.value.find(type => type.id === selectedPunishmentTypeId.value)?.name ?? '',
)

const generatedRuleName = computed(() => {
  if (selectedPenaltyTypeName.value && selectedPunishmentTypeName.value) {
    return `${selectedPenaltyTypeName.value} -> ${selectedPunishmentTypeName.value}`
  }
  return t('rules.defaultName')
})

watch(open, async (isOpen) => {
  if (!isOpen) return
  clearErrors()
  selectedPenaltyTypeId.value = ''
  selectedPunishmentTypeId.value = ''
  threshold.value = 3
  mode.value = 'at'
  dueAtAfterDays.value = 7

  await Promise.all([
    fetchPenaltyTypes(),
    fetchPunishmentTypes(),
  ])
})

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  clearErrors()

  try {
    await $api('/rules/', {
      method: 'POST',
      body: {
        name: generatedRuleName.value,
        resulting_punishment_type_id: selectedPunishmentTypeId.value,
        penalty_type_id: selectedPenaltyTypeId.value,
        threshold: Math.trunc(threshold.value),
        due_at_after_days: Math.trunc(dueAtAfterDays.value),
        mode: mode.value,
        is_active: true,
      },
    })
    open.value = false
    emit('created')
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
    <DialogContent class="min-w-0 overflow-x-hidden sm:max-w-md" @open-auto-focus.prevent>
      <DialogHeader>
        <DialogTitle>{{ t('modals.rule.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.rule.title') }}</DialogDescription>
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
            {{ t('modals.rule.create') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
