<script setup lang="ts">
const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

const props = defineProps<{
  studentId: string | null
  studentName: string
  classroomName: string
  removeFn: (id: string) => Promise<void>
}>()

const message = computed(() =>
  t('modals.classroom.removeMessage', {
    student: props.studentName,
    classroom: props.classroomName,
  }),
)
</script>

<template>
  <ConfirmActionModal
    v-model:open="open"
    :item-id="props.studentId"
    :action-fn="props.removeFn"
    :title="t('modals.classroom.removeTitle')"
    :message="message"
    :success-message="t('common.feedback.removeSuccess')"
    :cancel-label="t('common.actions.cancel')"
    :confirm-label="t('common.actions.remove')"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
