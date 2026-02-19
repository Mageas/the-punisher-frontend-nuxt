<script setup lang="ts">
import type { PenaltyType } from '~/types/api'

const props = defineProps<{
  penaltyTypes: readonly PenaltyType[]
  placeholder?: string
  emptyText?: string
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()
</script>

<template>
  <IdNameSearchInput
    v-model="modelValue"
    :options="props.penaltyTypes"
    :placeholder="props.placeholder ?? t('modals.penalty.selectPenaltyType')"
    :empty-text="props.emptyText ?? t('modals.penalty.noPenaltyTypeFound')"
  />
</template>
