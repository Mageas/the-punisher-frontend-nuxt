<script setup lang="ts">
import { usePunishments } from '~/composables/usePunishments'

const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { resolvePunishment } = usePunishments()

const props = defineProps<{
  punishmentId: string | null
}>()
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.punishmentId"
    :action-fn="resolvePunishment"
    :title="t('modals.resolve.title')"
    :message="t('modals.resolve.punishmentMessage')"
    :cancel-label="t('modals.resolve.cancel')"
    :confirm-label="t('modals.resolve.confirm')"
    @confirmed="emit('confirmed')"
  />
</template>
