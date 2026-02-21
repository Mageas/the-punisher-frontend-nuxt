<script setup lang="ts">
import type { PunishmentType } from '~/types/api'

const props = defineProps<{
  punishmentTypes: readonly PunishmentType[]
  placeholder?: string
  emptyText?: string
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()
</script>

<template>
  <IdNameSearchInput
    v-model="modelValue"
    :options="props.punishmentTypes"
    :placeholder="props.placeholder ?? t('modals.punishment.selectPunishmentType')"
    :empty-text="props.emptyText ?? t('modals.punishment.noPunishmentTypeFound')"
  />
</template>
