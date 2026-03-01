<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { IdNameOptionsFetcher } from '~/composables/useLazyIdNameOptions'

interface IdNameOption {
  id: string
  name: string
}

const props = defineProps<{
  label: string
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  options?: readonly IdNameOption[]
  fetchOptions?: IdNameOptionsFetcher
  optionsScopeKey?: string | number | boolean | null
  searchDebounceMs?: number
  selectedLabel?: string
}>()

const modelValue = defineModel<string>({ default: '' })

function clear() {
  modelValue.value = ''
}
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between">
      <Label class="text-xs font-medium text-muted-foreground">{{ props.label }}</Label>
      <Button
        v-if="modelValue"
        variant="ghost"
        size="icon-sm"
        class="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground"
        @click="clear"
      >
        <X class="h-3 w-3" />
      </Button>
    </div>
    <IdNameSelect
      v-model="modelValue"
      :options="props.options"
      :fetch-options="props.fetchOptions"
      :options-scope-key="props.optionsScopeKey"
      :search-debounce-ms="props.searchDebounceMs"
      :selected-label="props.selectedLabel"
      :placeholder="props.placeholder"
      :search-placeholder="props.searchPlaceholder"
      :empty-text="props.emptyText"
    />
  </div>
</template>
