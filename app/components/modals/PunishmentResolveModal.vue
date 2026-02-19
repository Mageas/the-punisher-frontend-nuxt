<script setup lang="ts">
import ConfirmActionModal from '~/components/modals/ConfirmActionModal.vue'

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
    :cancel-label="t('modals.resolve.cancel')"
    :confirm-label="t('modals.resolve.confirm')"
    @confirmed="emit('confirmed')"
  />
</template>
