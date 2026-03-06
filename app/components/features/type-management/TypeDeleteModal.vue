<script setup lang="ts">
const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

const props = defineProps<{
  typeId: string | null
  deleteFn: (id: string) => Promise<void>
  message: string
}>()
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.typeId"
    :action-fn="props.deleteFn"
    :title="t('modals.delete.title')"
    :message="props.message"
    :warning-message="t('modals.delete.typeChildrenWarning')"
    :cancel-label="t('common.actions.cancel')"
    :confirm-label="t('common.actions.delete')"
    :lock-duration-seconds="4"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
