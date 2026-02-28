<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface IdNameOption {
  id: string
  name: string
}

const props = defineProps<{
  label: string
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  options: readonly IdNameOption[]
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
      :placeholder="props.placeholder"
      :search-placeholder="props.searchPlaceholder"
      :empty-text="props.emptyText"
    />
  </div>
</template>
