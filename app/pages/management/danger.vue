<script setup lang="ts">
import { Monitor, School, ShieldAlert, Users } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const { t } = useI18n()
const { logoutAll } = useAuth()
const { deleteAllStudents: deleteAllStudentsRequest } = useStudents()
const { deleteAllClassrooms: deleteAllClassroomsRequest } = useClassrooms()
const userStore = useUserStore()

const showLogoutAllConfirm = ref(false)
const showDeleteStudentsConfirm = ref(false)
const showDeleteClassroomsConfirm = ref(false)

async function logoutAllDevices(_: string) {
  userStore.clearUser()
  await logoutAll()
}

async function deleteAllStudents(_: string) {
  await deleteAllStudentsRequest()
  toast.success(t('dangerZone.deleteAllStudents.success'))
}

async function deleteAllClassrooms(_: string) {
  await deleteAllClassroomsRequest()
  toast.success(t('dangerZone.deleteAllClassrooms.success'))
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
        @action="showDeleteStudentsConfirm = true"
      />

      <DangerActionCard
        :icon="School"
        :title="t('dangerZone.deleteAllClassrooms.title')"
        :description="t('dangerZone.deleteAllClassrooms.description')"
        :button-label="t('dangerZone.deleteAllClassrooms.button')"
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

    <Separator class="my-6" />

    <div class="space-y-3">
      <StudentImportCard />
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
