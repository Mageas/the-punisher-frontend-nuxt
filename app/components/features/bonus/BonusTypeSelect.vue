<script setup lang="ts">
import type { BonusType } from '~/types/api'
import { toIdNameOption } from '~/composables/useTrackedEntityFilterOptions'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  bonusTypes?: readonly BonusType[]
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  selectedName?: string
}>()

const emit = defineEmits<{
  selectedOption: [option: { id: string; name: string } | null]
}>()

const modelValue = defineModel<string>({ default: '' })
const attrs = useAttrs()

const { fetchBonusTypeOptions } = useTrackedEntityFilterOptions()

const options = computed(() => (props.bonusTypes ?? []).map(toIdNameOption))
const shouldUseRemoteOptions = computed(() => props.bonusTypes === undefined)
</script>

<template>
  <TypeSelect
    v-bind="attrs"
    v-model="modelValue"
    :options="options"
    :fetch-options="shouldUseRemoteOptions ? fetchBonusTypeOptions : undefined"
    :selected-name="props.selectedName"
    :placeholder="props.placeholder"
    :search-placeholder="props.searchPlaceholder"
    :empty-text="props.emptyText"
    @selected-option="emit('selectedOption', $event)"
  />
</template>
