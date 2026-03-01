<script setup lang="ts">
import type { PunishmentType } from '~/types/api'

const props = defineProps<{
  punishmentTypes?: readonly PunishmentType[]
  placeholder?: string
  emptyText?: string
  selectedName?: string
}>()

const emit = defineEmits<{
  selectedOption: [option: { id: string; name: string } | null]
}>()

const modelValue = defineModel<string>({ default: '' })

const { t } = useI18n()
const typeService = useTypeService()

const shouldUseRemoteOptions = computed(() => props.punishmentTypes === undefined)

async function fetchPunishmentTypeOptions(options: { page: number; search?: string }) {
  const response = await typeService.getPunishmentTypes(options)

  return {
    ...response,
    data: response.data.map((punishmentType) => ({
      id: punishmentType.id,
      name: punishmentType.name,
    })),
  }
}
</script>

<template>
  <FilterIdNameSelect
    v-model="modelValue"
    :options="props.punishmentTypes"
    :fetch-options="shouldUseRemoteOptions ? fetchPunishmentTypeOptions : undefined"
    :selected-label="props.selectedName"
    :placeholder="props.placeholder ?? t('modals.punishment.selectPunishmentType')"
    :search-placeholder="props.placeholder ?? t('modals.punishment.selectPunishmentType')"
    :empty-text="props.emptyText ?? t('modals.punishment.noPunishmentTypeFound')"
    @selected-option="emit('selectedOption', $event)"
  />
</template>
