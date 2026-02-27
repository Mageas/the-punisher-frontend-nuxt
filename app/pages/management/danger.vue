<script setup lang="ts">
import { Monitor, School, ShieldAlert, Users } from 'lucide-vue-next'

const { t } = useI18n()
const { logoutAll } = useAuth()
const userStore = useUserStore()

const showLogoutAllConfirm = ref(false)
const showDeleteStudentsConfirm = ref(false)
const showDeleteClassroomsConfirm = ref(false)

async function logoutAllDevices(_: string) {
  userStore.clearUser()
  await logoutAll()
}

async function deleteAllStudents(_: string) {
  // API not yet available — placeholder for future implementation
  throw new Error(t('dangerZone.deleteAllStudents.unavailable'))
}

async function deleteAllClassrooms(_: string) {
  // API not yet available — placeholder for future implementation
  throw new Error(t('dangerZone.deleteAllClassrooms.unavailable'))
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeaderBar>
      <template #left>
        <div class="flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
            <ShieldAlert class="size-5 text-destructive" />
          </div>
          <div>
            <h1 class="text-2xl font-bold tracking-tight">{{ t('dangerZone.title') }}</h1>
            <p class="text-sm text-muted-foreground">{{ t('dangerZone.description') }}</p>
          </div>
        </div>
      </template>
    </PageHeaderBar>

    <div class="space-y-3">
      <DangerActionCard
        :icon="Users"
        :title="t('dangerZone.deleteAllStudents.title')"
        :description="t('dangerZone.deleteAllStudents.description')"
        :button-label="t('dangerZone.deleteAllStudents.button')"
        disabled
        :disabled-message="t('dangerZone.deleteAllStudents.unavailable')"
        @action="showDeleteStudentsConfirm = true"
      />

      <DangerActionCard
        :icon="School"
        :title="t('dangerZone.deleteAllClassrooms.title')"
        :description="t('dangerZone.deleteAllClassrooms.description')"
        :button-label="t('dangerZone.deleteAllClassrooms.button')"
        disabled
        :disabled-message="t('dangerZone.deleteAllClassrooms.unavailable')"
        @action="showDeleteClassroomsConfirm = true"
      />

      <DangerActionCard
        :icon="Monitor"
        :title="t('dangerZone.logoutAll.title')"
        :description="t('dangerZone.logoutAll.description')"
        :button-label="t('dangerZone.logoutAll.button')"
        @action="showLogoutAllConfirm = true"
      />
    </div>

    <ConfirmActionModal
      v-model:open="showLogoutAllConfirm"
      item-id="logout-all-devices"
      :action-fn="logoutAllDevices"
      :title="t('dangerZone.logoutAll.confirmTitle')"
      :message="t('dangerZone.logoutAll.confirmMessage')"
      :warning-message="t('dangerZone.logoutAll.confirmWarning')"
      :cancel-label="t('common.cancel')"
      :confirm-label="t('dangerZone.logoutAll.confirmButton')"
      confirm-variant="destructive"
      :lock-duration-seconds="3"
    />

    <ConfirmActionModal
      v-model:open="showDeleteStudentsConfirm"
      item-id="delete-all-students"
      :action-fn="deleteAllStudents"
      :title="t('dangerZone.deleteAllStudents.confirmTitle')"
      :message="t('dangerZone.deleteAllStudents.confirmMessage')"
      :warning-message="t('dangerZone.deleteAllStudents.confirmWarning')"
      :cancel-label="t('common.cancel')"
      :confirm-label="t('dangerZone.deleteAllStudents.confirmButton')"
      confirm-variant="destructive"
      :lock-duration-seconds="5"
    />

    <ConfirmActionModal
      v-model:open="showDeleteClassroomsConfirm"
      item-id="delete-all-classrooms"
      :action-fn="deleteAllClassrooms"
      :title="t('dangerZone.deleteAllClassrooms.confirmTitle')"
      :message="t('dangerZone.deleteAllClassrooms.confirmMessage')"
      :warning-message="t('dangerZone.deleteAllClassrooms.confirmWarning')"
      :cancel-label="t('common.cancel')"
      :confirm-label="t('dangerZone.deleteAllClassrooms.confirmButton')"
      confirm-variant="destructive"
      :lock-duration-seconds="5"
    />
  </div>
</template>
