<script setup lang="ts">
const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

const props = defineProps<{
  punishmentId: string | null
  resolveFn: (id: string) => Promise<void>
}>()
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.punishmentId"
    :action-fn="props.resolveFn"
    :title="t('modals.resolve.title')"
    :message="t('modals.resolve.punishmentMessage')"
    :cancel-label="t('common.actions.cancel')"
    :confirm-label="t('common.actions.resolve')"
    @confirmed="emit('confirmed')"
  />
</template>
