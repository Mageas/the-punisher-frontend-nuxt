<script setup lang="ts">
import type { BonusType } from '~/types/api'

const props = defineProps<{
  bonusTypes?: readonly BonusType[]
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

const shouldUseRemoteOptions = computed(() => props.bonusTypes === undefined)

async function fetchBonusTypeOptions(options: { page: number; search?: string }) {
  const response = await typeService.getBonusTypes(options)

  return {
    ...response,
    data: response.data.map((bonusType) => ({
      id: bonusType.id,
      name: bonusType.name,
    })),
  }
}
</script>

<template>
  <FilterIdNameSelect
    v-model="modelValue"
    :options="props.bonusTypes"
    :fetch-options="shouldUseRemoteOptions ? fetchBonusTypeOptions : undefined"
    :selected-label="props.selectedName"
    :placeholder="props.placeholder ?? t('common.placeholders.selectType')"
    :search-placeholder="props.placeholder ?? t('common.placeholders.selectType')"
    :empty-text="props.emptyText ?? t('common.empty.noTypeFound')"
    @selected-option="emit('selectedOption', $event)"
  />
</template>
