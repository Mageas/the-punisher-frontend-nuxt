<script setup lang="ts">
type PasswordFieldName = 'current_password' | 'new_password' | 'confirm_password'

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    fieldName: PasswordFieldName
    placeholder?: string
    error?: string | null
    hint?: string | null
  }>(),
  {
    placeholder: '',
    error: null,
    hint: null,
  },
)

const emit = defineEmits<{
  'clear-error': [field: PasswordFieldName]
}>()

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="space-y-2">
    <Label :for="props.id">{{ props.label }}</Label>
    <Input
      :id="props.id"
      v-model="model"
      type="password"
      :placeholder="props.placeholder"
      :aria-invalid="props.error ? true : undefined"
      @input="emit('clear-error', props.fieldName)"
    />
    <InlineFieldError :message="props.error" />
    <p v-if="!props.error && props.hint" class="text-xs text-muted-foreground">
      {{ props.hint }}
    </p>
  </div>
</template>
