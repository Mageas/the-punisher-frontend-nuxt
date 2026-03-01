<script setup lang="ts">
import { computed } from 'vue'

interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    label: string
    placeholder: string
    options: readonly SelectOption[]
    searchPlaceholder?: string
    emptyText?: string
  }>(),
  {
    searchPlaceholder: undefined,
    emptyText: undefined,
  },
)

const modelValue = defineModel<string>({ default: '' })
const { t } = useI18n()

const mappedOptions = computed(() =>
  props.options.map((option) => ({
    id: option.value,
    name: option.label,
  })),
)

const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? props.placeholder)
const resolvedEmptyText = computed(() => props.emptyText ?? t('filters.noTypeFound'))
</script>

<template>
  <FilterIdNameSelect
    v-model="modelValue"
    :label="props.label"
    :placeholder="props.placeholder"
    :search-placeholder="resolvedSearchPlaceholder"
    :empty-text="resolvedEmptyText"
    :options="mappedOptions"
  />
</template>
