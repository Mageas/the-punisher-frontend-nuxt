<script setup lang="ts">
import type { PenaltyType } from '~/types/api'

const props = defineProps<{
  penaltyTypes: readonly PenaltyType[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()
</script>

<template>
  <IdNameSelect
    v-model="modelValue"
    :options="props.penaltyTypes"
    :placeholder="props.placeholder ?? t('modals.penalty.selectPenaltyType')"
    :search-placeholder="props.searchPlaceholder ?? t('modals.penalty.searchPenaltyType')"
    :empty-text="props.emptyText ?? t('modals.penalty.noPenaltyTypeFound')"
  />
</template>
