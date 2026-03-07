<script setup lang="ts">
import {
  getPasswordConfirmationError,
  getPasswordFieldError,
  hasClientValidationErrors,
  MIN_PASSWORD_LENGTH,
} from '~/lib/auth-form-validation'

definePageMeta({
  layout: false,
  auth: false,
})

const { t } = useI18n()
const { resetPassword } = useAuth()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

useGlobalErrorToast(globalError)
await useGuestOnlyPage()

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const { isPending: isLoading, withPending: withResetPasswordLoading } = useApiActionState()
const tokenLocalError = ref<string | null>(null)
const hasAttemptedSubmit = ref(false)
const localErrors = computed(() => ({
  new_password: getPasswordFieldError(form.newPassword, t, { submitted: hasAttemptedSubmit.value }),
  confirm_password: getPasswordConfirmationError(form.newPassword, form.confirmPassword, t, {
    submitted: hasAttemptedSubmit.value,
  }),
}))

function clearTokenErrors() {
  clearFieldError('token')
  tokenLocalError.value = null
}

const { token: resetToken } = useResetPasswordToken({
  onTokenSync: clearTokenErrors,
})
const tokenAlertMessage = computed(() => tokenLocalError.value || fieldErrors.value.token || '')

async function onSubmit() {
  clearErrors()
  tokenLocalError.value = null
  hasAttemptedSubmit.value = true

  if (!resetToken.value.trim()) {
    tokenLocalError.value = t('auth.resetPassword.tokenRequired')
    return
  }

  if (hasClientValidationErrors(localErrors.value)) {
    return
  }

  try {
    await withResetPasswordLoading(async () => {
      await resetPassword({
        token: resetToken.value,
        new_password: form.newPassword,
        confirm_password: form.confirmPassword,
      })
      await navigateTo({
        path: '/login',
        query: { reset: '1' },
      })
    })
  } catch (err) {
    handleApiError(err)
  }
}

function onNewPasswordInput() {
  clearFieldError('new_password')
}

function onConfirmPasswordInput() {
  clearFieldError('confirm_password')
}
</script>

<template>
  <AuthPageShell
    :title="t('auth.resetPassword.title')"
    :subtitle="t('auth.resetPassword.subtitle')"
  >
    <AuthPageCard>
      <AuthAlertStack
        :alerts="[
          {
            id: 'token',
            message: tokenAlertMessage,
            variant: 'destructive',
          },
        ]"
      />

      <form class="space-y-4" @submit.prevent="onSubmit">
        <AuthField
          id="new-password"
          v-model="form.newPassword"
          type="password"
          :label="t('userSettings.newPassword')"
          :placeholder="t('auth.passwordPlaceholder')"
          :error="localErrors.new_password || fieldErrors.new_password"
          :hint="t('auth.passwordRequirements.minLength', { count: MIN_PASSWORD_LENGTH })"
          @input="onNewPasswordInput"
        />

        <AuthField
          id="confirm-password"
          v-model="form.confirmPassword"
          type="password"
          :label="t('auth.passwordConfirm')"
          :placeholder="t('auth.passwordPlaceholder')"
          :error="localErrors.confirm_password || fieldErrors.confirm_password"
          @input="onConfirmPasswordInput"
        />

        <LoadingButton type="submit" class="mt-2 w-full cursor-pointer" :loading="isLoading">
          {{ t('auth.resetPassword.submit') }}
        </LoadingButton>
      </form>
    </AuthPageCard>

    <AuthFooterLink
      :prompt="t('auth.hasAccount')"
      to="/login"
      :label="t('common.actions.signIn')"
    />
  </AuthPageShell>
</template>
