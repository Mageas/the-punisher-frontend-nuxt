<script setup lang="ts">
import { parseApiError } from "@/lib/api-error"
import type { Student } from "@/types/models"

const props = defineProps<{
  open: boolean
  student: Student | null
}>()

const emit = defineEmits<{
  (e: "update:open", value: boolean): void
  (e: "deleted"): void
}>()

const { t } = useI18n()
const apiClient = useApiClient()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
})

const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

// Reset error when dialog opens
watch(isOpen, (newValue) => {
  if (newValue) {
    deleteError.value = null
  }
})

async function confirm() {
  if (isDeleting.value || !props.student) return

  isDeleting.value = true
  deleteError.value = null

  try {
    await apiClient.apiFetch(`/students/${props.student.id}`, {
      method: "DELETE",
    })

    emit("deleted")
    isOpen.value = false
  } catch (error) {
    deleteError.value = parseApiError(error).message
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('general.confirm_delete') }}</DialogTitle>
        <DialogDescription>
          {{ $t('students.delete_description') }}
        </DialogDescription>
      </DialogHeader>

      <Alert v-if="deleteError" variant="destructive">
        <AlertTitle>{{ $t('students.delete_error') }}</AlertTitle>
        <AlertDescription>{{ deleteError }}</AlertDescription>
      </Alert>

      <DialogFooter>
        <DialogClose as-child>
          <Button type="button" variant="outline">{{ $t('general.cancel') }}</Button>
        </DialogClose>
        <Button
          type="button"
          variant="destructive"
          :disabled="isDeleting || !props.student"
          @click="confirm"
        >
          <span v-if="isDeleting">{{ $t('general.loading') }}</span>
          <span v-else>{{ $t('general.delete') }}</span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
