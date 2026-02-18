<script setup lang="ts">
import { Skull } from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

const { t } = useI18n()
const { login, isAuthenticated } = useAuth()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

if (isAuthenticated.value) {
  await navigateTo('/')
}

const form = reactive({
  email: '',
  password: '',
})
const isLoading = ref(false)

async function onSubmit() {
  clearErrors()
  isLoading.value = true

  try {
    await login(form.email, form.password)
    await navigateTo('/')
  }
  catch (err) {
    handleApiError(err)
  }
  finally {
    isLoading.value = false
  }
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
        <!-- Global error -->
        <Alert v-if="globalError" variant="destructive" class="mb-4">
          <AlertDescription>{{ globalError }}</AlertDescription>
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
              :aria-invalid="!!fieldErrors.email"
              @input="clearFieldError('email')"
            />
            <p v-if="fieldErrors.email" class="text-sm text-destructive">
              {{ fieldErrors.email }}
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
              :aria-invalid="!!fieldErrors.password"
              @input="clearFieldError('password')"
            />
            <p v-if="fieldErrors.password" class="text-sm text-destructive">
              {{ fieldErrors.password }}
            </p>
          </div>

          <!-- Submit -->
          <Button type="submit" class="w-full mt-2" :disabled="isLoading">
            {{ t('auth.loginSubmit') }}
          </Button>
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
