<script setup lang="ts">
import { useBonuses } from '~/composables/useBonuses'

const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { useBonus } = useBonuses()

const props = defineProps<{
  bonusId: string | null
}>()
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.bonusId"
    :action-fn="useBonus"
    :title="t('modals.use.title')"
    :message="t('modals.use.bonusMessage')"
    :cancel-label="t('modals.use.cancel')"
    :confirm-label="t('modals.use.confirm')"
    @confirmed="emit('confirmed')"
  />
</template>
