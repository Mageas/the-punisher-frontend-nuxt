<script setup lang="ts">
import type { IdNameOption, IdNameOptionsFetcher } from '~/composables/useLazyIdNameOptions'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    options?: readonly IdNameOption[]
    fetchOptions?: IdNameOptionsFetcher
    optionsScopeKey?: string | number | boolean | null
    placeholder: string
    searchPlaceholder?: string
    emptyText: string
    selectedName?: string
    keepFocusOnSelect?: boolean
    fullWidth?: boolean
    noneOptionLabel?: string
    noneValueLabel?: string
    wrapperClass?: string
  }>(),
  {
    options: () => [],
    fetchOptions: undefined,
    optionsScopeKey: null,
    searchPlaceholder: undefined,
    selectedName: undefined,
    keepFocusOnSelect: false,
    fullWidth: true,
    noneOptionLabel: undefined,
    noneValueLabel: undefined,
    wrapperClass: '',
  },
)

const modelValue = defineModel<string>({ default: '' })
const emit = defineEmits<{
  selectedOption: [option: IdNameOption | null]
}>()
const attrs = useAttrs()
</script>

<template>
  <div v-if="props.wrapperClass" :class="props.wrapperClass">
    <FilterIdNameSelect
      v-bind="attrs"
      v-model="modelValue"
      :options="props.options"
      :fetch-options="props.fetchOptions"
      :options-scope-key="props.optionsScopeKey"
      :selected-label="props.selectedName"
      :placeholder="props.placeholder"
      :search-placeholder="props.searchPlaceholder"
      :empty-text="props.emptyText"
      :keep-focus-on-select="props.keepFocusOnSelect"
      :full-width="props.fullWidth"
      :none-option-label="props.noneOptionLabel"
      :none-value-label="props.noneValueLabel"
      @selected-option="emit('selectedOption', $event)"
    />
  </div>

  <FilterIdNameSelect
    v-else
    v-bind="attrs"
    v-model="modelValue"
    :options="props.options"
    :fetch-options="props.fetchOptions"
    :options-scope-key="props.optionsScopeKey"
    :selected-label="props.selectedName"
    :placeholder="props.placeholder"
    :search-placeholder="props.searchPlaceholder"
    :empty-text="props.emptyText"
    :keep-focus-on-select="props.keepFocusOnSelect"
    :full-width="props.fullWidth"
    :none-option-label="props.noneOptionLabel"
    :none-value-label="props.noneValueLabel"
    @selected-option="emit('selectedOption', $event)"
  />
</template>
