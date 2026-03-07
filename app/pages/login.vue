<script setup lang="ts">
import { Skull } from 'lucide-vue-next'
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
const route = useRoute()
const { login, isAuthenticated } = useAuth()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

useGlobalErrorToast(globalError)

if (isAuthenticated.value) {
  await navigateTo('/')
}

const form = reactive({
  email: '',
  password: '',
})
const { isPending: isLoading, withPending: withLoginLoading } = useApiActionState()
const showConfirmedSuccess = computed(() => route.query.confirmed === '1')
const showPasswordResetSuccess = computed(() => route.query.reset === '1')
const localErrors = ref({
  email: '',
  password: '',
})

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
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary mb-4">
          <Skull class="w-6 h-6" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('app.title') }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ t('auth.loginSubtitle') }}
        </p>
      </div>

      <!-- Card -->
      <div class="rounded-lg border border-border bg-card p-6 shadow-sm">
        <Alert v-if="showConfirmedSuccess" class="mb-4">
          <AlertDescription>{{ t('auth.confirmEmail.loginSuccess') }}</AlertDescription>
        </Alert>
        <Alert v-if="showPasswordResetSuccess" class="mb-4">
          <AlertDescription>{{ t('auth.resetPassword.loginSuccess') }}</AlertDescription>
        </Alert>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <!-- Email -->
          <div class="space-y-2">
            <Label for="email">{{ t('auth.email') }}</Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              :placeholder="t('auth.emailPlaceholder')"
              :aria-invalid="!!localErrors.email || !!fieldErrors.email"
              @input="onEmailInput"
            />
            <p v-if="localErrors.email || fieldErrors.email" class="text-sm text-destructive">
              {{ localErrors.email || fieldErrors.email }}
            </p>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <Label for="password">{{ t('auth.password') }}</Label>
            <Input
              id="password"
              v-model="form.password"
              type="password"
              :placeholder="t('auth.passwordPlaceholder')"
              :aria-invalid="!!localErrors.password || !!fieldErrors.password"
              @input="onPasswordInput"
            />
            <p v-if="localErrors.password || fieldErrors.password" class="text-sm text-destructive">
              {{ localErrors.password || fieldErrors.password }}
            </p>
            <div class="flex justify-end">
              <NuxtLink
                to="/forgot-password"
                class="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {{ t('auth.forgotPasswordLink') }}
              </NuxtLink>
            </div>
          </div>

          <!-- Submit -->
          <LoadingButton type="submit" class="w-full mt-2 cursor-pointer" :loading="isLoading">
            {{ t('common.actions.signIn') }}
          </LoadingButton>
        </form>
      </div>

      <!-- Link -->
      <p class="text-center text-sm text-muted-foreground mt-4">
        {{ t('auth.noAccount') }}
        <NuxtLink to="/register" class="underline underline-offset-4 hover:text-foreground">
          {{ t('auth.createAccount') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
