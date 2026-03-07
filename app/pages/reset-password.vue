<script setup lang="ts">
import { Skull } from 'lucide-vue-next'
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
const route = useRoute()
const { resetPassword, isAuthenticated } = useAuth()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

useGlobalErrorToast(globalError)

if (isAuthenticated.value) {
  await navigateTo('/')
}

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const resetToken = ref('')
const isLoading = ref(false)
const tokenLocalError = ref<string | null>(null)
const hasAttemptedSubmit = ref(false)
const localErrors = computed(() => ({
  new_password: getPasswordFieldError(form.newPassword, t, { submitted: hasAttemptedSubmit.value }),
  confirm_password: getPasswordConfirmationError(form.newPassword, form.confirmPassword, t, {
    submitted: hasAttemptedSubmit.value,
  }),
}))

function extractTokenFromHash(rawHash: string): string {
  const hash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash
  const normalizedHash = hash.trim()

  if (!normalizedHash) {
    return ''
  }

  const directParams = new URLSearchParams(normalizedHash)
  const directToken = directParams.get('token')
  if (directToken) {
    return directToken
  }

  const queryIndex = normalizedHash.indexOf('?')
  if (queryIndex !== -1) {
    const nestedParams = new URLSearchParams(normalizedHash.slice(queryIndex + 1))
    const nestedToken = nestedParams.get('token')
    if (nestedToken) {
      return nestedToken
    }
  }

  return normalizedHash.replace(/^\/+/, '')
}

function syncTokenFromHash(rawHash: string) {
  const tokenFromHash = extractTokenFromHash(rawHash)
  if (tokenFromHash) {
    resetToken.value = tokenFromHash
  }
}

function readQueryParam(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function syncTokenFromQuery(rawQueryToken: unknown) {
  const tokenFromQuery = readQueryParam(rawQueryToken)
  if (tokenFromQuery) {
    resetToken.value = tokenFromQuery
  }
}

function clearTokenErrors() {
  clearFieldError('token')
  tokenLocalError.value = null
}

watch(
  () => route.hash,
  (hash) => {
    syncTokenFromHash(hash)
    clearTokenErrors()
  },
)

watch(
  () => route.query.token,
  (queryToken) => {
    syncTokenFromQuery(queryToken)
    clearTokenErrors()
  },
)

onMounted(() => {
  syncTokenFromHash(window.location.hash)
  syncTokenFromQuery(route.query.token)
  syncTokenFromQuery(new URLSearchParams(window.location.search).get('token'))
  clearTokenErrors()
})

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

  isLoading.value = true

  try {
    await resetPassword({
      token: resetToken.value,
      new_password: form.newPassword,
      confirm_password: form.confirmPassword,
    })
    await navigateTo({
      path: '/login',
      query: { reset: '1' },
    })
  } catch (err) {
    handleApiError(err)
  } finally {
    isLoading.value = false
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
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary mb-4">
          <Skull class="w-6 h-6" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('auth.resetPassword.title') }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ t('auth.resetPassword.subtitle') }}
        </p>
      </div>

      <div class="rounded-lg border border-border bg-card p-6 shadow-sm">
        <Alert v-if="tokenLocalError || fieldErrors.token" variant="destructive" class="mb-4">
          <AlertDescription>{{ tokenLocalError || fieldErrors.token }}</AlertDescription>
        </Alert>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label for="new-password">{{ t('userSettings.newPassword') }}</Label>
            <Input
              id="new-password"
              v-model="form.newPassword"
              type="password"
              :placeholder="t('auth.passwordPlaceholder')"
              :aria-invalid="!!localErrors.new_password || !!fieldErrors.new_password"
              @input="onNewPasswordInput"
            />
            <p
              v-if="localErrors.new_password || fieldErrors.new_password"
              class="text-sm text-destructive"
            >
              {{ localErrors.new_password || fieldErrors.new_password }}
            </p>
            <p v-else class="text-xs text-muted-foreground">
              {{ t('auth.passwordRequirements.minLength', { count: MIN_PASSWORD_LENGTH }) }}
            </p>
          </div>

          <div class="space-y-2">
            <Label for="confirm-password">{{ t('auth.passwordConfirm') }}</Label>
            <Input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              :placeholder="t('auth.passwordPlaceholder')"
              :aria-invalid="!!localErrors.confirm_password || !!fieldErrors.confirm_password"
              @input="onConfirmPasswordInput"
            />
            <p
              v-if="localErrors.confirm_password || fieldErrors.confirm_password"
              class="text-sm text-destructive"
            >
              {{ localErrors.confirm_password || fieldErrors.confirm_password }}
            </p>
          </div>

          <Button type="submit" class="w-full mt-2 cursor-pointer" :disabled="isLoading">
            {{ t('auth.resetPassword.submit') }}
          </Button>
        </form>
      </div>

      <p class="text-center text-sm text-muted-foreground mt-4">
        {{ t('auth.hasAccount') }}
        <NuxtLink to="/login" class="underline underline-offset-4 hover:text-foreground">
          {{ t('common.actions.signIn') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
