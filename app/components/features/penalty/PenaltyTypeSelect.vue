<script setup lang="ts">
import type { PenaltyType } from '~/types/api'
import { toIdNameOption } from '~/composables/useTrackedEntityFilterOptions'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  penaltyTypes?: readonly PenaltyType[]
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

const { fetchPenaltyTypeOptions } = useTrackedEntityFilterOptions()

const options = computed(() => (props.penaltyTypes ?? []).map(toIdNameOption))
const shouldUseRemoteOptions = computed(() => props.penaltyTypes === undefined)
</script>

<template>
  <TypeSelect
    v-bind="attrs"
    v-model="modelValue"
    :options="options"
    :fetch-options="shouldUseRemoteOptions ? fetchPenaltyTypeOptions : undefined"
    :selected-name="props.selectedName"
    :placeholder="props.placeholder"
    :search-placeholder="props.searchPlaceholder"
    :empty-text="props.emptyText"
    @selected-option="emit('selectedOption', $event)"
  />
</template>
