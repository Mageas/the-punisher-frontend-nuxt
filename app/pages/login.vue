<script setup lang="ts">
import {
  getEmailFieldError,
  getRequiredFieldError,
  hasClientValidationErrors,
} from '~/lib/auth-form-validation'

definePageMeta({
  layout: false,
  auth: false,
})

const { t } = useI18n()
useSeoMeta({ title: () => t('common.actions.signIn') })

const route = useRoute()
const { login } = useAuth()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

useGlobalErrorToast(globalError)
await useGuestOnlyPage()

const form = reactive({
  email: '',
  password: '',
})
const { isPending: isLoading, withPending: withLoginLoading } = useApiActionState()
const confirmedQuery = useRouteStringQueryParam(() => route.query.confirmed)
const resetQuery = useRouteStringQueryParam(() => route.query.reset)
const localErrors = ref({
  email: '',
  password: '',
})
const emailError = computed(() => localErrors.value.email || fieldErrors.value.email || '')
const passwordError = computed(() => localErrors.value.password || fieldErrors.value.password || '')
const alerts = computed(() => [
  {
    id: 'confirmed',
    message: confirmedQuery.value === '1' ? t('auth.confirmEmail.loginSuccess') : '',
  },
  {
    id: 'reset',
    message: resetQuery.value === '1' ? t('auth.resetPassword.loginSuccess') : '',
  },
])

async function onSubmit() {
  clearErrors()

  localErrors.value = {
    email: getEmailFieldError(form.email, t, { submitted: true }),
    password: getRequiredFieldError(form.password, t, { submitted: true }),
  }

  if (hasClientValidationErrors(localErrors.value)) {
    return
  }

  try {
    await withLoginLoading(async () => {
      await login(form.email, form.password)
      await navigateTo('/')
    })
  } catch (err) {
    handleApiError(err)
  }
}

function onEmailInput() {
  clearFieldError('email')
  localErrors.value.email = ''
}

function onPasswordInput() {
  clearFieldError('password')
  localErrors.value.password = ''
}
</script>

<template>
  <AuthPageShell :title="t('app.title')" :subtitle="t('auth.loginSubtitle')">
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

        <AuthField
          id="password"
          v-model="form.password"
          type="password"
          :label="t('auth.password')"
          :placeholder="t('auth.passwordPlaceholder')"
          :error="passwordError"
          @input="onPasswordInput"
        >
          <template #footer>
            <div class="flex justify-end">
              <NuxtLink
                to="/forgot-password"
                class="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {{ t('auth.forgotPasswordLink') }}
              </NuxtLink>
            </div>
          </template>
        </AuthField>

        <LoadingButton type="submit" class="mt-2 w-full cursor-pointer" :loading="isLoading">
          {{ t('common.actions.signIn') }}
        </LoadingButton>
      </form>
    </AuthPageCard>

    <AuthFooterLink :prompt="t('auth.noAccount')" to="/register" :label="t('auth.createAccount')" />
  </AuthPageShell>
</template>
