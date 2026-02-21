<script setup lang="ts">
import { usePunishmentsStore } from '~/stores/punishments.store'

const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const store = usePunishmentsStore()

const props = defineProps<{
  punishmentId: string | null
}>()

async function deletePunishment(id: string) {
  await store.deleteOne(id)
}
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.punishmentId"
    :action-fn="deletePunishment"
    :title="t('modals.delete.title')"
    :message="t('modals.delete.punishmentMessage')"
    :cancel-label="t('modals.delete.cancel')"
    :confirm-label="t('modals.delete.confirm')"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
