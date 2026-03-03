<script setup lang="ts">
import { MailSearch, Skull } from 'lucide-vue-next'

definePageMeta({
  layout: false,
  auth: false,
})

const { t } = useI18n()
const { forgotPassword, isAuthenticated } = useAuth()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

if (isAuthenticated.value) {
  await navigateTo('/')
}

const form = reactive({
  email: '',
})
const isLoading = ref(false)
const localError = ref<string | null>(null)
const successMessage = ref<string | null>(null)

async function onSubmit() {
  clearErrors()
  localError.value = null
  successMessage.value = null

  const email = form.email.trim()
  if (!email) {
    localError.value = t('auth.forgotPassword.emailRequired')
    return
  }

  isLoading.value = true

  try {
    await forgotPassword(email)
    successMessage.value = t('auth.forgotPassword.success')
  } catch (err) {
    handleApiError(err)
  } finally {
    isLoading.value = false
  }
}

function onEmailInput() {
  clearFieldError('email')
  localError.value = null
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
          {{ t('auth.forgotPassword.title') }}
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          {{ t('auth.forgotPassword.subtitle') }}
        </p>
      </div>

      <div class="rounded-lg border border-border bg-card p-6 shadow-sm">
        <Alert v-if="successMessage" class="mb-4">
          <AlertDescription>{{ successMessage }}</AlertDescription>
        </Alert>

        <Alert v-if="globalError" variant="destructive" class="mb-4">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="space-y-2">
            <Label for="email">{{ t('auth.email') }}</Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              :placeholder="t('auth.emailPlaceholder')"
              :aria-invalid="!!fieldErrors.email || !!localError"
              @input="onEmailInput"
            />
            <p v-if="fieldErrors.email" class="text-sm text-destructive">
              {{ fieldErrors.email }}
            </p>
            <p v-if="localError" class="text-sm text-destructive">
              {{ localError }}
            </p>
          </div>

          <Button type="submit" class="w-full mt-2 cursor-pointer" :disabled="isLoading">
            {{ t('auth.forgotPassword.submit') }}
          </Button>
        </form>
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
