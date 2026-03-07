<script setup lang="ts">
import { MailCheck } from 'lucide-vue-next'

definePageMeta({
  layout: false,
  auth: false,
})

const { t } = useI18n()
const route = useRoute()
const { confirmEmail, resendConfirmationEmail } = useAuth()

const {
  fieldErrors: confirmFieldErrors,
  globalError: confirmGlobalError,
  handleApiError: handleConfirmApiError,
  clearErrors: clearConfirmErrors,
  clearFieldError: clearConfirmFieldError,
} = useApiErrors()

const {
  fieldErrors: resendFieldErrors,
  globalError: resendGlobalError,
  handleApiError: handleResendApiError,
  clearErrors: clearResendErrors,
  clearFieldError: clearResendFieldError,
} = useApiErrors()

useGlobalErrorToast(confirmGlobalError)
useGlobalErrorToast(resendGlobalError)
await useGuestOnlyPage()

const confirmForm = reactive({
  token: '',
})

const resendForm = reactive({
  email: '',
})

const { isPending: isConfirmLoading, withPending: withConfirmLoading } = useApiActionState()
const { isPending: isResendLoading, withPending: withResendLoading } = useApiActionState()
const confirmLocalError = ref<string | null>(null)
const resendLocalError = ref<string | null>(null)
const resendSuccess = ref<string | null>(null)
const queryToken = useRouteStringQueryParam(() => route.query.token)
const queryEmail = useRouteStringQueryParam(() => route.query.email)
const registeredQuery = useRouteStringQueryParam(() => route.query.registered)

const showRegisterNotice = computed(() => registeredQuery.value === '1')
const confirmTokenError = computed(
  () => confirmFieldErrors.value.token || confirmLocalError.value || '',
)
const resendEmailError = computed(
  () => resendFieldErrors.value.email || resendLocalError.value || '',
)
const headerAlerts = computed(() => [
  {
    id: 'registered',
    message: showRegisterNotice.value ? t('auth.confirmEmail.registerSuccessNotice') : '',
  },
])
const resendAlerts = computed(() => [
  {
    id: 'resend-success',
    message: resendSuccess.value,
  },
])

watch(
  queryToken,
  (nextToken) => {
    if (nextToken) {
      confirmForm.token = nextToken
    }
  },
  { immediate: true },
)

watch(
  queryEmail,
  (nextEmail) => {
    if (nextEmail) {
      resendForm.email = nextEmail
    }
  },
  { immediate: true },
)

async function onConfirmEmail() {
  clearConfirmErrors()
  confirmLocalError.value = null

  const token = confirmForm.token.trim()
  if (!token) {
    confirmLocalError.value = t('auth.confirmEmail.tokenRequired')
    return
  }

  try {
    await withConfirmLoading(async () => {
      await confirmEmail(token)
      await navigateTo({
        path: '/login',
        query: { confirmed: '1' },
      })
    })
  } catch (err) {
    handleConfirmApiError(err)
  }
}

async function onResendEmail() {
  clearResendErrors()
  resendLocalError.value = null
  resendSuccess.value = null

  const email = resendForm.email.trim()
  if (!email) {
    resendLocalError.value = t('auth.confirmEmail.emailRequired')
    return
  }

  try {
    await withResendLoading(async () => {
      await resendConfirmationEmail(email)
      resendSuccess.value = t('auth.confirmEmail.resendSuccess')
    })
  } catch (err) {
    handleResendApiError(err)
  }
}

function onTokenInput() {
  clearConfirmFieldError('token')
  confirmLocalError.value = null
}

function onResendEmailInput() {
  clearResendFieldError('email')
  resendLocalError.value = null
}
</script>

<template>
  <AuthPageShell :title="t('auth.confirmEmail.title')" :subtitle="t('auth.confirmEmail.subtitle')">
    <AuthPageCard class="space-y-5">
      <AuthAlertStack :alerts="headerAlerts" />

      <div class="flex items-start gap-3 rounded-md bg-secondary/60 p-3">
        <MailCheck class="mt-0.5 h-5 w-5" />
        <p class="text-sm text-muted-foreground">
          {{ t('auth.confirmEmail.tokenHint') }}
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="onConfirmEmail">
        <AuthField
          id="token"
          v-model="confirmForm.token"
          type="text"
          :label="t('auth.confirmEmail.tokenLabel')"
          :placeholder="t('auth.confirmEmail.tokenPlaceholder')"
          :error="confirmTokenError"
          @input="onTokenInput"
        />

        <LoadingButton type="submit" class="w-full cursor-pointer" :loading="isConfirmLoading">
          {{ t('auth.confirmEmail.submit') }}
        </LoadingButton>
      </form>

      <div class="border-t border-border pt-3">
        <AuthField
          id="resend-email"
          v-model="resendForm.email"
          type="email"
          :label="t('auth.confirmEmail.emailLabel')"
          :placeholder="t('auth.emailPlaceholder')"
          :error="resendEmailError"
          @input="onResendEmailInput"
        />

        <AuthAlertStack :alerts="resendAlerts" class="mt-3" />

        <LoadingButton
          type="button"
          variant="link"
          class="mt-2 cursor-pointer px-0"
          :loading="isResendLoading"
          @click="onResendEmail"
        >
          {{ t('auth.confirmEmail.resendLink') }}
        </LoadingButton>
      </div>
    </AuthPageCard>

    <AuthFooterLink
      :prompt="t('auth.hasAccount')"
      to="/login"
      :label="t('common.actions.signIn')"
    />
  </AuthPageShell>
</template>
