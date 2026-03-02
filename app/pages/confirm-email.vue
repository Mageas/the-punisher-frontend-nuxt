<script setup lang="ts">
import { MailCheck, Skull } from 'lucide-vue-next'

definePageMeta({
  layout: false,
  auth: false,
})

const { t } = useI18n()
const route = useRoute()
const { confirmEmail, resendConfirmationEmail, isAuthenticated } = useAuth()

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

if (isAuthenticated.value) {
  await navigateTo('/')
}

const confirmForm = reactive({
  token: '',
})

const resendForm = reactive({
  email: '',
})

const isConfirmLoading = ref(false)
const isResendLoading = ref(false)
const confirmLocalError = ref<string | null>(null)
const resendLocalError = ref<string | null>(null)
const resendSuccess = ref<string | null>(null)

const showRegisterNotice = computed(() => route.query.registered === '1')

function readQueryParam(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

watch(
  () => route.query.token,
  (token) => {
    const nextToken = readQueryParam(token)
    if (nextToken) {
      confirmForm.token = nextToken
    }
  },
  { immediate: true },
)

watch(
  () => route.query.email,
  (email) => {
    const nextEmail = readQueryParam(email)
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

  isConfirmLoading.value = true

  try {
    await confirmEmail(token)
    await navigateTo({
      path: '/login',
      query: { confirmed: '1' },
    })
  } catch (err) {
    handleConfirmApiError(err)
  } finally {
    isConfirmLoading.value = false
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

  isResendLoading.value = true

  try {
    await resendConfirmationEmail(email)
    resendSuccess.value = t('auth.confirmEmail.resendSuccess')
  } catch (err) {
    handleResendApiError(err)
  } finally {
    isResendLoading.value = false
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
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary mb-4">
          <Skull class="w-6 h-6" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('auth.confirmEmail.title') }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ t('auth.confirmEmail.subtitle') }}
        </p>
      </div>

      <div class="rounded-lg border border-border bg-card p-6 shadow-sm space-y-5">
        <Alert v-if="showRegisterNotice">
          <AlertDescription>{{ t('auth.confirmEmail.registerSuccessNotice') }}</AlertDescription>
        </Alert>

        <div class="flex items-start gap-3 rounded-md bg-secondary/60 p-3">
          <MailCheck class="w-5 h-5 mt-0.5" />
          <p class="text-sm text-muted-foreground">
            {{ t('auth.confirmEmail.tokenHint') }}
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="onConfirmEmail">
          <div class="space-y-2">
            <Label for="token">{{ t('auth.confirmEmail.tokenLabel') }}</Label>
            <Input
              id="token"
              v-model="confirmForm.token"
              type="text"
              :placeholder="t('auth.confirmEmail.tokenPlaceholder')"
              :aria-invalid="!!confirmFieldErrors.token || !!confirmLocalError"
              @input="onTokenInput"
            />
            <p v-if="confirmFieldErrors.token" class="text-sm text-destructive">
              {{ confirmFieldErrors.token }}
            </p>
            <p v-if="confirmLocalError" class="text-sm text-destructive">
              {{ confirmLocalError }}
            </p>
          </div>

          <Alert v-if="confirmGlobalError" variant="destructive">
            <AlertDescription>{{ confirmGlobalError }}</AlertDescription>
          </Alert>

          <Button type="submit" class="w-full cursor-pointer" :disabled="isConfirmLoading">
            {{ t('auth.confirmEmail.submit') }}
          </Button>
        </form>

        <div class="pt-3 border-t border-border">
          <div class="space-y-2">
            <Label for="resend-email">{{ t('auth.confirmEmail.emailLabel') }}</Label>
            <Input
              id="resend-email"
              v-model="resendForm.email"
              type="email"
              :placeholder="t('auth.emailPlaceholder')"
              :aria-invalid="!!resendFieldErrors.email || !!resendLocalError"
              @input="onResendEmailInput"
            />
            <p v-if="resendFieldErrors.email" class="text-sm text-destructive">
              {{ resendFieldErrors.email }}
            </p>
            <p v-if="resendLocalError" class="text-sm text-destructive">
              {{ resendLocalError }}
            </p>
          </div>

          <Alert v-if="resendGlobalError" variant="destructive" class="mt-3">
            <AlertDescription>{{ resendGlobalError }}</AlertDescription>
          </Alert>

          <Alert v-if="resendSuccess" class="mt-3">
            <AlertDescription>{{ resendSuccess }}</AlertDescription>
          </Alert>

          <Button
            type="button"
            variant="link"
            class="px-0 mt-2 cursor-pointer"
            :disabled="isResendLoading"
            @click="onResendEmail"
          >
            {{ t('auth.confirmEmail.resendLink') }}
          </Button>
        </div>
      </div>

      <p class="text-center text-sm text-muted-foreground mt-4">
        {{ t('auth.hasAccount') }}
        <NuxtLink to="/login" class="underline underline-offset-4 hover:text-foreground">
          {{ t('auth.signIn') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
