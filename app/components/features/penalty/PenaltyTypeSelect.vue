<script setup lang="ts">
import type { PenaltyType } from '~/types/api'

const props = defineProps<{
  penaltyTypes?: readonly PenaltyType[]
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

const shouldUseRemoteOptions = computed(() => props.penaltyTypes === undefined)

async function fetchPenaltyTypeOptions(options: { page: number; search?: string }) {
  const response = await typeService.getPenaltyTypes(options)

  return {
    ...response,
    data: response.data.map((penaltyType) => ({
      id: penaltyType.id,
      name: penaltyType.name,
    })),
  }
}
</script>

<template>
  <FilterIdNameSelect
    v-model="modelValue"
    :options="props.penaltyTypes"
    :fetch-options="shouldUseRemoteOptions ? fetchPenaltyTypeOptions : undefined"
    :selected-label="props.selectedName"
    :placeholder="props.placeholder ?? t('modals.penalty.selectPenaltyType')"
    :search-placeholder="props.placeholder ?? t('modals.penalty.selectPenaltyType')"
    :empty-text="props.emptyText ?? t('modals.penalty.noPenaltyTypeFound')"
    @selected-option="emit('selectedOption', $event)"
  />
</template>
