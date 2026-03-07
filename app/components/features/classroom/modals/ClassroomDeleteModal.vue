<script setup lang="ts">
const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

const props = defineProps<{
  classroomId: string | null
  classroomName: string
  deleteFn: (id: string) => Promise<void>
}>()

const message = computed(() => t('modals.delete.classroomMessage', { name: props.classroomName }))
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.classroomId"
    :action-fn="props.deleteFn"
    :title="t('modals.delete.title')"
    :message="message"
    :success-message="t('common.feedback.deleteSuccess')"
    :cancel-label="t('common.actions.cancel')"
    :confirm-label="t('common.actions.delete')"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
