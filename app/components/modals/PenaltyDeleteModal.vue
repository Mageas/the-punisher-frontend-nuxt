<script setup lang="ts">
import { usePenaltiesStore } from '~/stores/penalties.store'

const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const store = usePenaltiesStore()

const props = defineProps<{
  penaltyId: string | null
}>()

async function deletePenalty(id: string) {
  await store.deleteOne(id)
}
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.penaltyId"
    :action-fn="deletePenalty"
    :title="t('modals.delete.title')"
    :message="t('modals.delete.penaltyMessage')"
    :cancel-label="t('modals.delete.cancel')"
    :confirm-label="t('modals.delete.confirm')"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
