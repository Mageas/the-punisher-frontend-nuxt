<script setup lang="ts">
import { LockKeyhole, Skull } from 'lucide-vue-next'
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
const { register, isAuthenticated, isRegisterAllowed } = useAuth()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

useGlobalErrorToast(globalError)

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
        <form class="space-y-4" @submit.prevent="onSubmit">
          <!-- Nom / Prénom -->
          <div class="space-y-2">
            <Label for="lastname">{{ t('common.labels.name') }}</Label>
            <Input
              id="lastname"
              v-model="form.lastName"
              type="text"
              :placeholder="t('common.placeholders.lastName')"
              :aria-invalid="!!localErrors.last_name || !!fieldErrors.last_name"
              @input="clearFieldError('last_name')"
            />
            <p
              v-if="localErrors.last_name || fieldErrors.last_name"
              class="text-sm text-destructive"
            >
              {{ localErrors.last_name || fieldErrors.last_name }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="firstname">{{ t('common.labels.firstName') }}</Label>
            <Input
              id="firstname"
              v-model="form.firstName"
              type="text"
              :placeholder="t('common.placeholders.firstName')"
              :aria-invalid="!!localErrors.first_name || !!fieldErrors.first_name"
              @input="clearFieldError('first_name')"
            />
            <p
              v-if="localErrors.first_name || fieldErrors.first_name"
              class="text-sm text-destructive"
            >
              {{ localErrors.first_name || fieldErrors.first_name }}
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
              :aria-invalid="!!localErrors.email || !!fieldErrors.email"
              @input="clearFieldError('email')"
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
              @input="clearFieldError('password')"
            />
            <p v-if="localErrors.password || fieldErrors.password" class="text-sm text-destructive">
              {{ localErrors.password || fieldErrors.password }}
            </p>
            <p v-else class="text-xs text-muted-foreground">
              {{ t('auth.passwordRequirements.minLength', { count: MIN_PASSWORD_LENGTH }) }}
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
              :aria-invalid="!!localErrors.password_confirm"
            />
            <p v-if="localErrors.password_confirm" class="text-sm text-destructive">
              {{ localErrors.password_confirm }}
            </p>
          </div>

          <!-- Submit -->
          <LoadingButton type="submit" class="w-full mt-2 cursor-pointer" :loading="isLoading">
            {{ t('auth.registerSubmit') }}
          </LoadingButton>
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
