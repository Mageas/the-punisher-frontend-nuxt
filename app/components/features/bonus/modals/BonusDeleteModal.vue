<script setup lang="ts">
const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

const props = defineProps<{
  bonusId: string | null
  deleteFn: (id: string) => Promise<void>
}>()
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.bonusId"
    :action-fn="props.deleteFn"
    :title="t('modals.delete.title')"
    :message="t('modals.delete.bonusMessage')"
    :cancel-label="t('common.actions.cancel')"
    :confirm-label="t('common.actions.delete')"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
