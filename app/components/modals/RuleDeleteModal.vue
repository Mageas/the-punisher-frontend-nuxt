<script setup lang="ts">
import { useRulesStore } from '~/stores/rules.store'

const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const store = useRulesStore()

const props = defineProps<{
  ruleId: string | null
}>()

async function deleteRule(id: string) {
  await store.deleteOne(id)
}
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.ruleId"
    :action-fn="deleteRule"
    :title="t('modals.delete.title')"
    :message="t('modals.delete.ruleMessage')"
    :cancel-label="t('modals.delete.cancel')"
    :confirm-label="t('modals.delete.confirm')"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
