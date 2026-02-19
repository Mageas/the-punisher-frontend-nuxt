<script setup lang="ts">
import ConfirmActionModal from '~/components/modals/ConfirmActionModal.vue'

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
    :cancel-label="t('modals.classroom.cancel')"
    :confirm-label="t('modals.classroom.removeConfirm')"
    confirm-variant="destructive"
    @confirmed="emit('confirmed')"
  />
</template>
