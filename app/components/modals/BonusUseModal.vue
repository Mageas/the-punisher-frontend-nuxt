<script setup lang="ts">
import ConfirmActionModal from '~/components/modals/ConfirmActionModal.vue'

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
    :cancel-label="t('modals.use.cancel')"
    :confirm-label="t('modals.use.confirm')"
    @confirmed="emit('confirmed')"
  />
</template>
