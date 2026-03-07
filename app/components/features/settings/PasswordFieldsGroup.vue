<script setup lang="ts">
type PasswordFieldName = 'current_password' | 'new_password' | 'confirm_password'

const props = withDefaults(
  defineProps<{
    currentPasswordError?: string | null
    newPasswordError?: string | null
    confirmPasswordError?: string | null
    passwordPlaceholder?: string
    newPasswordHint?: string | null
  }>(),
  {
    currentPasswordError: null,
    newPasswordError: null,
    confirmPasswordError: null,
    passwordPlaceholder: '',
    newPasswordHint: null,
  },
)

const emit = defineEmits<{
  'clear-field-error': [field: PasswordFieldName]
}>()

const currentPassword = defineModel<string>('currentPassword', { default: '' })
const newPassword = defineModel<string>('newPassword', { default: '' })
const confirmPassword = defineModel<string>('confirmPassword', { default: '' })

const { t } = useI18n()
</script>

<template>
  <div class="space-y-5" data-testid="password-fields-group">
    <PasswordFieldControl
      id="current-password"
      v-model="currentPassword"
      field-name="current_password"
      :label="t('userSettings.currentPassword')"
      :placeholder="props.passwordPlaceholder"
      :error="props.currentPasswordError"
      @clear-error="emit('clear-field-error', $event)"
    />

    <div class="grid gap-5 sm:grid-cols-2">
      <PasswordFieldControl
        id="new-password"
        v-model="newPassword"
        field-name="new_password"
        :label="t('userSettings.newPassword')"
        :placeholder="props.passwordPlaceholder"
        :error="props.newPasswordError"
        :hint="props.newPasswordHint"
        @clear-error="emit('clear-field-error', $event)"
      />

      <PasswordFieldControl
        id="confirm-password"
        v-model="confirmPassword"
        field-name="confirm_password"
        :label="t('userSettings.confirmPassword')"
        :placeholder="props.passwordPlaceholder"
        :error="props.confirmPasswordError"
        @clear-error="emit('clear-field-error', $event)"
      />
    </div>
  </div>
</template>
