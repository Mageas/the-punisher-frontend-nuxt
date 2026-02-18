<script setup lang="ts">
import type { BonusType } from '~/types/api'

const props = defineProps<{
  bonusTypes: readonly BonusType[]
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
    :options="props.bonusTypes"
    :placeholder="props.placeholder ?? t('modals.bonus.selectBonusType')"
    :search-placeholder="props.searchPlaceholder ?? t('modals.bonus.searchBonusType')"
    :empty-text="props.emptyText ?? t('modals.bonus.noBonusTypeFound')"
  />
</template>
