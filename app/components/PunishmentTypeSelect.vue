<script setup lang="ts">
import type { PunishmentType } from '~/types/api'

const props = defineProps<{
  punishmentTypes: readonly PunishmentType[]
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
    :options="props.punishmentTypes"
    :placeholder="props.placeholder ?? t('modals.punishment.selectPunishmentType')"
    :search-placeholder="props.searchPlaceholder ?? t('modals.punishment.searchPunishmentType')"
    :empty-text="props.emptyText ?? t('modals.punishment.noPunishmentTypeFound')"
  />
</template>
