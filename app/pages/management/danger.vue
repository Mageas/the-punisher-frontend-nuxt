<script setup lang="ts">
import { School, ShieldAlert, Users } from 'lucide-vue-next'

const { t } = useI18n()
useSeoMeta({ title: () => t('common.titles.dangerZone') })

const { deleteAllStudents: deleteAllStudentsRequest } = useStudents()
const { deleteAllClassrooms: deleteAllClassroomsRequest } = useClassrooms()

const showDeleteStudentsConfirm = ref(false)
const showDeleteClassroomsConfirm = ref(false)

async function deleteAllStudents(_: string) {
  await deleteAllStudentsRequest()
}

async function deleteAllClassrooms(_: string) {
  await deleteAllClassroomsRequest()
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeaderBar>
      <template #left>
        <IconPageHeading
          :icon="ShieldAlert"
          :title="t('common.titles.dangerZone')"
          :description="t('dangerZone.description')"
          tone="danger"
        />
      </template>
    </PageHeaderBar>

    <div class="space-y-3">
      <DangerActionCard
        :icon="Users"
        :title="t('dangerZone.deleteAllStudents.actionLabel')"
        :description="t('dangerZone.deleteAllStudents.description')"
        :button-label="t('dangerZone.deleteAllStudents.actionLabel')"
        @action="showDeleteStudentsConfirm = true"
      />

      <DangerActionCard
        :icon="School"
        :title="t('dangerZone.deleteAllClassrooms.actionLabel')"
        :description="t('dangerZone.deleteAllClassrooms.description')"
        :button-label="t('dangerZone.deleteAllClassrooms.actionLabel')"
        @action="showDeleteClassroomsConfirm = true"
      />
    </div>

    <Separator class="my-6" />

    <div class="space-y-3">
      <StudentImportCard />
    </div>

    <ConfirmActionModal
      v-model:open="showDeleteStudentsConfirm"
      item-id="delete-all-students"
      :action-fn="deleteAllStudents"
      :title="t('dangerZone.deleteAllStudents.confirmTitle')"
      :message="t('dangerZone.deleteAllStudents.confirmMessage')"
      :warning-message="t('dangerZone.deleteAllStudents.confirmWarning')"
      :success-message="t('dangerZone.deleteAllStudents.success')"
      :cancel-label="t('common.actions.cancel')"
      :confirm-label="t('dangerZone.deleteAllStudents.actionLabel')"
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
      :success-message="t('dangerZone.deleteAllClassrooms.success')"
      :cancel-label="t('common.actions.cancel')"
      :confirm-label="t('dangerZone.deleteAllClassrooms.actionLabel')"
      confirm-variant="destructive"
      :lock-duration-seconds="5"
    />
  </div>
</template>
