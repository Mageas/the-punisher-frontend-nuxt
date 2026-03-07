<script setup lang="ts">
import type { IdNameOption, IdNameOptionsFetcher } from '~/composables/useLazyIdNameOptions'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    options?: readonly IdNameOption[]
    fetchOptions?: IdNameOptionsFetcher
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    selectedName?: string
  }>(),
  {
    options: () => [],
    fetchOptions: undefined,
    placeholder: undefined,
    searchPlaceholder: undefined,
    emptyText: undefined,
    selectedName: undefined,
  },
)

const modelValue = defineModel<string>({ default: '' })
const emit = defineEmits<{
  selectedOption: [option: IdNameOption | null]
}>()
const attrs = useAttrs()

const { t } = useI18n()

const resolvedPlaceholder = computed(() => props.placeholder ?? t('common.placeholders.selectType'))
const resolvedEmptyText = computed(() => props.emptyText ?? t('common.empty.noTypeFound'))
</script>

<template>
  <FilterIdNameSelect
    v-bind="attrs"
    v-model="modelValue"
    :options="props.options"
    :fetch-options="props.fetchOptions"
    :selected-label="props.selectedName"
    :placeholder="resolvedPlaceholder"
    :search-placeholder="props.searchPlaceholder"
    :empty-text="resolvedEmptyText"
    @selected-option="emit('selectedOption', $event)"
  />
</template>
