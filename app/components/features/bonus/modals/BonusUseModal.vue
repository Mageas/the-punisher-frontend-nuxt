<script setup lang="ts">
const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

const props = defineProps<{
  bonusId: string | null
  useFn: (id: string) => Promise<void>
}>()
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.bonusId"
    :action-fn="props.useFn"
    :title="t('modals.use.title')"
    :message="t('modals.use.bonusMessage')"
    :success-message="t('common.feedback.consumeSuccess')"
    :cancel-label="t('common.actions.cancel')"
    :confirm-label="t('common.actions.consume')"
    @confirmed="emit('confirmed')"
  />
</template>
