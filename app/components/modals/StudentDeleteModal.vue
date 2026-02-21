<script setup lang="ts">

const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

const props = defineProps<{
  studentId: string | null
  deleteFn: (id: string) => Promise<void>
}>()
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.studentId"
    :action-fn="props.deleteFn"
    :title="t('modals.delete.title')"
    :message="t('modals.delete.studentMessage')"
    :cancel-label="t('modals.delete.cancel')"
    :confirm-label="t('modals.delete.confirm')"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
