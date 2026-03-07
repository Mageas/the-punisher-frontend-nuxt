<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  label: string
  placeholder: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-center justify-between">
      <Label class="text-xs font-medium text-muted-foreground">
        {{ props.label }}
      </Label>
      <Button
        v-if="props.modelValue"
        variant="ghost"
        size="icon-sm"
        class="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground"
        @click="emit('update:modelValue', '')"
      >
        <X class="h-3 w-3" />
      </Button>
    </div>

    <div class="relative">
      <Search
        class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        v-model="model"
        :placeholder="props.placeholder"
        class="h-8 pl-8 text-xs"
      />
    </div>
  </div>
</template>
