<script setup lang="ts">
definePageMeta({
  layout: false,
  auth: false,
})

const { t } = useI18n()
useSeoMeta({ title: () => t('auth.forgotPassword.title') })

const { forgotPassword } = useAuth()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

useGlobalErrorToast(globalError)
await useGuestOnlyPage()

const form = reactive({
  email: '',
})
const { isPending: isLoading, withPending: withForgotPasswordLoading } = useApiActionState()
const localError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const emailError = computed(() => fieldErrors.value.email || localError.value || '')
const alerts = computed(() => [
  {
    id: 'success',
    message: successMessage.value,
  },
])

async function onSubmit() {
  clearErrors()
  localError.value = null
  successMessage.value = null

  const email = form.email.trim()
  if (!email) {
    localError.value = t('auth.forgotPassword.emailRequired')
    return
  }

  try {
    await withForgotPasswordLoading(async () => {
      await forgotPassword(email)
      successMessage.value = t('auth.forgotPassword.success')
    })
  } catch (err) {
    handleApiError(err)
  }
}

function onEmailInput() {
  clearFieldError('email')
  localError.value = null
}
</script>

<template>
  <AuthPageShell
    :title="t('auth.forgotPassword.title')"
    :subtitle="t('auth.forgotPassword.subtitle')"
  >
    <AuthPageCard>
      <AuthAlertStack :alerts="alerts" />

      <form class="space-y-4" @submit.prevent="onSubmit">
        <AuthField
          id="email"
          v-model="form.email"
          type="email"
          :label="t('auth.email')"
          :placeholder="t('auth.emailPlaceholder')"
          :error="emailError"
          @input="onEmailInput"
        />

        <LoadingButton type="submit" class="mt-2 w-full cursor-pointer" :loading="isLoading">
          {{ t('auth.forgotPassword.submit') }}
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
