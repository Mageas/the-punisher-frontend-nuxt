<script setup lang="ts">
import { KeyRound, Monitor, ShieldCheck } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  getPasswordConfirmationError,
  getPasswordFieldError,
  getRequiredFieldError,
  hasClientValidationErrors,
  MIN_PASSWORD_LENGTH,
} from '~/lib/auth-form-validation'

const { t } = useI18n()
const { changePassword, logoutAll } = useAuth()
const userStore = useUserStore()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

useGlobalErrorToast(globalError)

const isSavingPassword = ref(false)
const showLogoutAllConfirm = ref(false)
const hasAttemptedPasswordSubmit = ref(false)
const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const localPasswordErrors = computed(() => ({
  current_password: getRequiredFieldError(form.currentPassword, t, {
    submitted: hasAttemptedPasswordSubmit.value,
  }),
  new_password: getPasswordFieldError(form.newPassword, t, {
    submitted: hasAttemptedPasswordSubmit.value,
  }),
  confirm_password: getPasswordConfirmationError(form.newPassword, form.confirmPassword, t, {
    submitted: hasAttemptedPasswordSubmit.value,
  }),
}))

function clearPasswordForm() {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  hasAttemptedPasswordSubmit.value = false
}

async function submitPasswordChange() {
  clearErrors()
  hasAttemptedPasswordSubmit.value = true

  if (hasClientValidationErrors(localPasswordErrors.value)) {
    return
  }

  isSavingPassword.value = true

  try {
    await changePassword(form.currentPassword, form.newPassword, form.confirmPassword)
    clearPasswordForm()
    toast.success(t('userSettings.passwordUpdated'))
  } catch (err) {
    handleApiError(err)
  } finally {
    isSavingPassword.value = false
  }
}

async function logoutAllDevices(_: string) {
  userStore.clearUser()
  await logoutAll()
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeaderBar>
      <template #left>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck class="size-5 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">{{ t('common.titles.userSettings') }}</h1>
            <p class="text-sm text-muted-foreground">{{ t('userSettings.description') }}</p>
          </div>
        </div>
      </template>
    </PageHeaderBar>

    <div class="space-y-3">
      <ActionPanelCard
        :title="t('userSettings.changePasswordTitle')"
        :description="t('userSettings.securityDescription')"
        :icon="KeyRound"
        variant="primary"
        content-class="space-y-4"
      >
        <form class="space-y-5" @submit.prevent="submitPasswordChange">
          <div class="space-y-2">
            <Label for="current-password">{{ t('userSettings.currentPassword') }}</Label>
            <Input
              id="current-password"
              v-model="form.currentPassword"
              type="password"
              :placeholder="t('auth.passwordPlaceholder')"
              :aria-invalid="
                !!localPasswordErrors.current_password || !!fieldErrors.current_password
              "
              @input="clearFieldError('current_password')"
            />
            <p
              v-if="localPasswordErrors.current_password || fieldErrors.current_password"
              class="text-sm text-destructive"
            >
              {{ localPasswordErrors.current_password || fieldErrors.current_password }}
            </p>
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="new-password">{{ t('userSettings.newPassword') }}</Label>
              <Input
                id="new-password"
                v-model="form.newPassword"
                type="password"
                :placeholder="t('auth.passwordPlaceholder')"
                :aria-invalid="!!localPasswordErrors.new_password || !!fieldErrors.new_password"
                @input="clearFieldError('new_password')"
              />
              <p
                v-if="localPasswordErrors.new_password || fieldErrors.new_password"
                class="text-sm text-destructive"
              >
                {{ localPasswordErrors.new_password || fieldErrors.new_password }}
              </p>
              <p v-else class="text-xs text-muted-foreground">
                {{ t('auth.passwordRequirements.minLength', { count: MIN_PASSWORD_LENGTH }) }}
              </p>
            </div>

            <div class="space-y-2">
              <Label for="confirm-password">{{ t('userSettings.confirmPassword') }}</Label>
              <Input
                id="confirm-password"
                v-model="form.confirmPassword"
                type="password"
                :placeholder="t('auth.passwordPlaceholder')"
                :aria-invalid="
                  !!localPasswordErrors.confirm_password || !!fieldErrors.confirm_password
                "
                @input="clearFieldError('confirm_password')"
              />
              <p
                v-if="localPasswordErrors.confirm_password || fieldErrors.confirm_password"
                class="text-sm text-destructive"
              >
                {{ localPasswordErrors.confirm_password || fieldErrors.confirm_password }}
              </p>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <Button type="submit" class="cursor-pointer" :disabled="isSavingPassword">
              {{ t('userSettings.savePassword') }}
            </Button>
          </div>
        </form>
      </ActionPanelCard>

      <ActionPanelCard
        :title="t('common.actions.logoutAll')"
        :description="t('userSettings.logoutAll.description')"
        :icon="Monitor"
      >
        <Button
          variant="destructive"
          class="cursor-pointer"
          type="button"
          @click="showLogoutAllConfirm = true"
        >
          {{ t('common.actions.logoutAll') }}
        </Button>
      </ActionPanelCard>
    </div>

    <ConfirmActionModal
      v-model:open="showLogoutAllConfirm"
      item-id="logout-all-devices"
      :action-fn="logoutAllDevices"
      :title="t('userSettings.logoutAll.confirmTitle')"
      :message="t('userSettings.logoutAll.confirmMessage')"
      :warning-message="t('userSettings.logoutAll.confirmWarning')"
      :cancel-label="t('common.actions.cancel')"
      :confirm-label="t('common.actions.logoutAll')"
      confirm-variant="destructive"
      :lock-duration-seconds="3"
    />
  </div>
</template>
