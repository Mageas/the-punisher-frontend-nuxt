<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface SelectOption {
  value: string
  label: string
}

const props = defineProps<{
  label: string
  placeholder: string
  options: SelectOption[]
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
    <Select v-model="modelValue">
      <SelectTrigger class="h-8 text-xs cursor-pointer">
        <SelectValue :placeholder="props.placeholder" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in props.options"
          :key="option.value"
          :value="option.value"
          class="cursor-pointer text-xs"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
