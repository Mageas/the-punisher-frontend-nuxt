<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    id: string
    modelValue: string
    label: string
    type?: string
    placeholder?: string
    error?: string | null
    hint?: string | null
  }>(),
  {
    type: 'text',
    placeholder: '',
    error: null,
    hint: null,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'input', value: Event): void
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <div class="space-y-2">
    <Label :for="props.id">{{ props.label }}</Label>
    <Input
      :id="props.id"
      v-model="model"
      :type="props.type"
      :placeholder="props.placeholder"
      :aria-invalid="props.error ? true : undefined"
      @input="emit('input', $event)"
    />
    <p v-if="props.error" class="text-sm text-destructive">
      {{ props.error }}
    </p>
    <p v-else-if="props.hint" class="text-xs text-muted-foreground">
      {{ props.hint }}
    </p>
    <slot name="footer" />
  </div>
</template>
