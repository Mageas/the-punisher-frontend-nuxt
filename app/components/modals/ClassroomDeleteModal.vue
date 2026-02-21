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
    :cancel-label="t('modals.delete.cancel')"
    :confirm-label="t('modals.delete.confirm')"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
