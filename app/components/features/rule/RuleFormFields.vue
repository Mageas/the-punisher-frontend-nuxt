<script setup lang="ts">
import type { RuleDueAtMode, RuleMode } from '~/types/api'

interface IdNameOption<T extends string> {
  id: T
  name: string
}

interface SelectedOption {
  id: string
  name: string
}

const props = withDefaults(
  defineProps<{
    dueAtMode: RuleDueAtMode
    modeOptions: readonly IdNameOption<RuleMode>[]
    dueAtModeOptions: readonly IdNameOption<RuleDueAtMode>[]
    nameLabel?: string
    namePlaceholder?: string
    penaltyTypeSelectedName?: string
    punishmentTypeSelectedName?: string
  }>(),
  {
    nameLabel: undefined,
    namePlaceholder: undefined,
    penaltyTypeSelectedName: undefined,
    punishmentTypeSelectedName: undefined,
  },
)

const emit = defineEmits<{
  penaltyTypeSelected: [option: SelectedOption | null]
  punishmentTypeSelected: [option: SelectedOption | null]
}>()
</script>

<template>
  <RuleNameField :label="props.nameLabel" :placeholder="props.namePlaceholder" />
  <RulePenaltyTypeField
    :selected-name="props.penaltyTypeSelectedName"
    @selected-option="emit('penaltyTypeSelected', $event)"
  />
  <RuleThresholdModeFields :mode-options="props.modeOptions" />
  <RulePunishmentTypeField
    :selected-name="props.punishmentTypeSelectedName"
    @selected-option="emit('punishmentTypeSelected', $event)"
  />
  <RuleDueModeFields :due-at-mode="props.dueAtMode" :due-at-mode-options="props.dueAtModeOptions" />
</template>
