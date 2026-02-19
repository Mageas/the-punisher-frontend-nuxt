<script setup lang="ts">
import ConfirmActionModal from '~/components/modals/ConfirmActionModal.vue'

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
    :cancel-label="t('modals.delete.cancel')"
    :confirm-label="t('modals.delete.confirm')"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
