<script setup lang="ts">
import { LockKeyhole } from 'lucide-vue-next'
import {
  getEmailFieldError,
  getPasswordConfirmationError,
  getPasswordFieldError,
  getRequiredFieldError,
  hasClientValidationErrors,
  MIN_PASSWORD_LENGTH,
} from '~/lib/auth-form-validation'

definePageMeta({
  layout: false,
  auth: false,
})

const { t } = useI18n()
const { register, isRegisterAllowed } = useAuth()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

useGlobalErrorToast(globalError)
await useGuestOnlyPage()

const registerAllowed = ref(true)

try {
  registerAllowed.value = await isRegisterAllowed()
} catch {
  // Keep form available if status endpoint is temporarily unreachable.
  registerAllowed.value = true
}

const form = reactive({
  lastName: '',
  firstName: '',
  email: '',
  password: '',
  passwordConfirm: '',
})
const { isPending: isLoading, withPending: withRegisterLoading } = useApiActionState()
const hasAttemptedSubmit = ref(false)
const localErrors = computed(() => ({
  last_name: getRequiredFieldError(form.lastName, t, { submitted: hasAttemptedSubmit.value }),
  first_name: getRequiredFieldError(form.firstName, t, { submitted: hasAttemptedSubmit.value }),
  email: getEmailFieldError(form.email, t, { submitted: hasAttemptedSubmit.value }),
  password: getPasswordFieldError(form.password, t, { submitted: hasAttemptedSubmit.value }),
  password_confirm: getPasswordConfirmationError(form.password, form.passwordConfirm, t, {
    submitted: hasAttemptedSubmit.value,
  }),
}))

async function onSubmit() {
  if (!registerAllowed.value) {
    return
  }

  clearErrors()
  hasAttemptedSubmit.value = true

  if (hasClientValidationErrors(localErrors.value)) {
    return
  }

  try {
    await withRegisterLoading(async () => {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
      })

      await navigateTo({
        path: '/confirm-email',
        query: {
          email: form.email,
          registered: '1',
        },
      })
    })
  } catch (err) {
    handleApiError(err)
  }
}

const registerSubtitle = computed(() =>
  registerAllowed.value ? t('auth.registerSubtitle') : t('auth.registerClosedSubtitle'),
)
</script>

<template>
  <AuthPageShell :title="t('app.title')" :subtitle="registerSubtitle">
    <AuthPageCard v-if="registerAllowed">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <AuthField
          id="lastname"
          v-model="form.lastName"
          type="text"
          :label="t('common.labels.name')"
          :placeholder="t('common.placeholders.lastName')"
          :error="localErrors.last_name || fieldErrors.last_name"
          @input="clearFieldError('last_name')"
        />
        <AuthField
          id="firstname"
          v-model="form.firstName"
          type="text"
          :label="t('common.labels.firstName')"
          :placeholder="t('common.placeholders.firstName')"
          :error="localErrors.first_name || fieldErrors.first_name"
          @input="clearFieldError('first_name')"
        />
        <AuthField
          id="email"
          v-model="form.email"
          type="email"
          :label="t('auth.email')"
          :placeholder="t('auth.emailPlaceholder')"
          :error="localErrors.email || fieldErrors.email"
          @input="clearFieldError('email')"
        />
        <AuthField
          id="password"
          v-model="form.password"
          type="password"
          :label="t('auth.password')"
          :placeholder="t('auth.passwordPlaceholder')"
          :error="localErrors.password || fieldErrors.password"
          :hint="t('auth.passwordRequirements.minLength', { count: MIN_PASSWORD_LENGTH })"
          @input="clearFieldError('password')"
        />
        <AuthField
          id="password-confirm"
          v-model="form.passwordConfirm"
          type="password"
          :label="t('auth.passwordConfirm')"
          :placeholder="t('auth.passwordPlaceholder')"
          :error="localErrors.password_confirm"
        />

        <LoadingButton type="submit" class="mt-2 w-full cursor-pointer" :loading="isLoading">
          {{ t('auth.registerSubmit') }}
        </LoadingButton>
      </form>
    </AuthPageCard>
    <AuthPageCard v-else>
      <div class="flex flex-col items-center space-y-4 text-center">
        <div
          class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive-bg-subtle"
        >
          <LockKeyhole class="h-6 w-6 text-destructive" />
        </div>
        <div class="space-y-1">
          <p class="text-sm font-medium">
            {{ t('auth.registerClosed') }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ t('auth.registerClosedHelp') }}
          </p>
        </div>
      </div>
    </AuthPageCard>

    <AuthFooterLink
      :prompt="t('auth.hasAccount')"
      to="/login"
      :label="t('common.actions.signIn')"
    />
  </AuthPageShell>
</template>
