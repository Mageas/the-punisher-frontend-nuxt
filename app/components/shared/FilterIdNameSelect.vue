<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import type { IdNameOptionsFetcher } from '~/composables/useLazyIdNameOptions'

defineOptions({
  inheritAttrs: false,
})

interface IdNameOption {
  id: string
  name: string
}

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder: string
    searchPlaceholder?: string
    emptyText: string
    options?: readonly IdNameOption[]
    fetchOptions?: IdNameOptionsFetcher
    optionsScopeKey?: string | number | boolean | null
    searchDebounceMs?: number
    selectedLabel?: string
    fullWidth?: boolean
    disabled?: boolean
    keepFocusOnSelect?: boolean
    noneOptionLabel?: string
    noneValueLabel?: string
    noneOptionValue?: string
    showClearButton?: boolean
  }>(),
  {
    label: undefined,
    searchPlaceholder: undefined,
    options: () => [],
    fetchOptions: undefined,
    optionsScopeKey: null,
    searchDebounceMs: 300,
    selectedLabel: undefined,
    fullWidth: true,
    disabled: false,
    keepFocusOnSelect: false,
    noneOptionLabel: undefined,
    noneValueLabel: undefined,
    noneOptionValue: undefined,
    showClearButton: undefined,
  },
)

const modelValue = defineModel<string>({ default: '' })
const emit = defineEmits<{
  selectedOption: [option: IdNameOption | null]
}>()
const attrs = useAttrs()

const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? props.placeholder)
const shouldShowClearButton = computed(() => {
  const enabled = props.showClearButton ?? Boolean(props.label)
  return enabled && Boolean(modelValue.value) && !props.disabled
})

function clear() {
  if (!modelValue.value) return
  modelValue.value = ''
  emit('selectedOption', null)
}
</script>

<template>
  <div class="space-y-1.5">
    <div v-if="props.label || shouldShowClearButton" class="flex items-center justify-between">
      <Label v-if="props.label" class="text-xs font-medium text-muted-foreground">{{
        props.label
      }}</Label>
      <span v-else />
      <Button
        v-if="shouldShowClearButton"
        variant="ghost"
        size="icon-sm"
        class="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground"
        @click="clear"
      >
        <X class="h-3 w-3" />
      </Button>
    </div>
    <IdNameSelect
      v-bind="attrs"
      v-model="modelValue"
      :options="props.options"
      :fetch-options="props.fetchOptions"
      :options-scope-key="props.optionsScopeKey"
      :search-debounce-ms="props.searchDebounceMs"
      :selected-label="props.selectedLabel"
      :full-width="props.fullWidth"
      :disabled="props.disabled"
      :keep-focus-on-select="props.keepFocusOnSelect"
      :none-option-label="props.noneOptionLabel"
      :none-value-label="props.noneValueLabel"
      :none-option-value="props.noneOptionValue"
      :placeholder="props.placeholder"
      :search-placeholder="resolvedSearchPlaceholder"
      :empty-text="props.emptyText"
      @selected-option="emit('selectedOption', $event)"
    />
  </div>
</template>
