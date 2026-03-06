<script setup lang="ts">
import { LockKeyhole, Skull } from 'lucide-vue-next'

definePageMeta({
  layout: false,
  auth: false,
})

const { t } = useI18n()
const { register, isAuthenticated, isRegisterAllowed } = useAuth()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

if (isAuthenticated.value) {
  await navigateTo('/')
}

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
const isLoading = ref(false)
const passwordMismatch = ref(false)

async function onSubmit() {
  if (!registerAllowed.value) {
    return
  }

  clearErrors()
  passwordMismatch.value = false

  if (form.password !== form.passwordConfirm) {
    passwordMismatch.value = true
    return
  }

  isLoading.value = true

  try {
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
  } catch (err) {
    handleApiError(err)
  } finally {
    isLoading.value = false
  }
}

const registerSubtitle = computed(() =>
  registerAllowed.value ? t('auth.registerSubtitle') : t('auth.registerClosedSubtitle'),
)
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
          {{ registerSubtitle }}
        </p>
      </div>

      <!-- Card -->
      <div v-if="registerAllowed" class="rounded-lg border border-border bg-card p-6 shadow-sm">
        <!-- Global error -->
        <Alert v-if="globalError" variant="destructive" class="mb-4">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <!-- Nom / Prénom -->
          <div class="space-y-2">
            <Label for="lastname">{{ t('common.labels.name') }}</Label>
            <Input
              id="lastname"
              v-model="form.lastName"
              type="text"
              :placeholder="t('common.placeholders.lastName')"
              :aria-invalid="!!fieldErrors.last_name"
              @input="clearFieldError('last_name')"
            />
            <p v-if="fieldErrors.last_name" class="text-sm text-destructive">
              {{ fieldErrors.last_name }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="firstname">{{ t('common.labels.firstName') }}</Label>
            <Input
              id="firstname"
              v-model="form.firstName"
              type="text"
              :placeholder="t('common.placeholders.firstName')"
              :aria-invalid="!!fieldErrors.first_name"
              @input="clearFieldError('first_name')"
            />
            <p v-if="fieldErrors.first_name" class="text-sm text-destructive">
              {{ fieldErrors.first_name }}
            </p>
          </div>

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

          <!-- Confirm Password -->
          <div class="space-y-2">
            <Label for="password-confirm">{{ t('auth.passwordConfirm') }}</Label>
            <Input
              id="password-confirm"
              v-model="form.passwordConfirm"
              type="password"
              :placeholder="t('auth.passwordPlaceholder')"
              :aria-invalid="passwordMismatch"
              @input="passwordMismatch = false"
            />
            <p v-if="passwordMismatch" class="text-sm text-destructive">
              {{ t('auth.passwordMismatch') }}
            </p>
          </div>

          <!-- Submit -->
          <Button type="submit" class="w-full mt-2 cursor-pointer" :disabled="isLoading">
            {{ t('auth.registerSubmit') }}
          </Button>
        </form>
      </div>
      <div v-else class="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div class="flex flex-col items-center text-center space-y-4">
          <div
            class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive-bg-subtle"
          >
            <LockKeyhole class="w-6 h-6 text-destructive" />
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
      </div>

      <!-- Link -->
      <p class="text-center text-sm text-muted-foreground mt-4">
        {{ t('auth.hasAccount') }}
        <NuxtLink to="/login" class="underline underline-offset-4 hover:text-foreground">
          {{ t('common.actions.signIn') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>
