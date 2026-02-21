<script setup lang="ts">
import type { BonusType } from '~/types/api'

const props = defineProps<{
  bonusTypes: readonly BonusType[]
  placeholder?: string
  emptyText?: string
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()
</script>

<template>
  <IdNameSearchInput
    v-model="modelValue"
    :options="props.bonusTypes"
    :placeholder="props.placeholder ?? t('modals.bonus.selectBonusType')"
    :empty-text="props.emptyText ?? t('modals.bonus.noBonusTypeFound')"
  />
</template>
