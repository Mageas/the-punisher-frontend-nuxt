<script setup lang="ts">
import { KeyRound, Monitor, ShieldCheck } from 'lucide-vue-next'
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
const { isPending: isSavingPassword, withPending: withPasswordSave } = useApiActionState()
const { notifyUpdateSuccess } = useActionToast()

useGlobalErrorToast(globalError)

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

const displayedPasswordErrors = computed(() => ({
  current_password:
    localPasswordErrors.value.current_password || fieldErrors.value.current_password,
  new_password: localPasswordErrors.value.new_password || fieldErrors.value.new_password,
  confirm_password:
    localPasswordErrors.value.confirm_password || fieldErrors.value.confirm_password,
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

  try {
    await withPasswordSave(async () => {
      await changePassword(form.currentPassword, form.newPassword, form.confirmPassword)
      clearPasswordForm()
      notifyUpdateSuccess(t('userSettings.passwordUpdated'))
    })
  } catch (err) {
    handleApiError(err)
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
        <IconPageHeading
          :icon="ShieldCheck"
          :title="t('common.titles.userSettings')"
          :description="t('userSettings.description')"
        />
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
          <PasswordFieldsGroup
            v-model:current-password="form.currentPassword"
            v-model:new-password="form.newPassword"
            v-model:confirm-password="form.confirmPassword"
            :current-password-error="displayedPasswordErrors.current_password"
            :new-password-error="displayedPasswordErrors.new_password"
            :confirm-password-error="displayedPasswordErrors.confirm_password"
            :password-placeholder="t('auth.passwordPlaceholder')"
            :new-password-hint="
              t('auth.passwordRequirements.minLength', { count: MIN_PASSWORD_LENGTH })
            "
            @clear-field-error="clearFieldError"
          />

          <div class="flex justify-end pt-2">
            <LoadingButton type="submit" class="cursor-pointer" :loading="isSavingPassword">
              {{ t('userSettings.savePassword') }}
            </LoadingButton>
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
