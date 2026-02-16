<script setup lang="ts">
import { parseApiError } from "@/lib/api-error"
import type { Student } from "@/types/models"
import { toSingleStudent } from "@/utils/serializers"

const props = defineProps<{
  open: boolean
  student: Student | null
}>()

const emit = defineEmits<{
  (e: "update:open", value: boolean): void
  (e: "updated"): void
}>()

const { t } = useI18n()
const apiClient = useApiClient()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
})

const isUpdating = ref(false)
const isLoading = ref(false)
const editError = ref<string | null>(null)

const form = reactive({
  firstName: "",
  lastName: "",
})

// Reset and fill form when dialog opens
watch(isOpen, async (newValue) => {
  if (newValue && props.student) {
    editError.value = null
    isLoading.value = true
    
    try {
      // Fetch fresh data
      const response = await apiClient.apiFetch<unknown>(`/students/${props.student.id}`)
      const freshData = toSingleStudent(response) ?? props.student
      
      form.firstName = freshData.first_name
      form.lastName = freshData.last_name
    } catch (error) {
      editError.value = parseApiError(error).message
      // Fallback to prop data
      form.firstName = props.student.first_name
      form.lastName = props.student.last_name
    } finally {
      isLoading.value = false
    }
  } else {
    form.firstName = ""
    form.lastName = ""
  }
})

async function submit() {
  if (isUpdating.value || !props.student) return

  const firstName = form.firstName.trim()
  const lastName = form.lastName.trim()

  if (!firstName || !lastName) {
    editError.value = t('students.validation_error')
    return
  }

  isUpdating.value = true
  editError.value = null

  try {
    await apiClient.apiFetch(`/students/${props.student.id}`, {
      method: "PUT",
      body: {
        first_name: firstName,
        last_name: lastName,
      },
    })

    emit("updated")
    isOpen.value = false
  } catch (error) {
    editError.value = parseApiError(error).message
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('students.edit_title') }}</DialogTitle>
        <DialogDescription>
          {{ $t('students.edit_description') }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="isLoading" class="space-y-2">
        <div class="h-4 w-full animate-pulse rounded bg-muted" />
        <div class="h-4 w-4/5 animate-pulse rounded bg-muted" />
      </div>

      <form v-else class="space-y-4" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="edit-first-name">{{ $t('students.firstname') }}</Label>
            <Input
              id="edit-first-name"
              v-model="form.firstName"
              placeholder="Lina"
              autocomplete="given-name"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="edit-last-name">{{ $t('students.lastname') }}</Label>
            <Input
              id="edit-last-name"
              v-model="form.lastName"
              placeholder="Martin"
              autocomplete="family-name"
              required
            />
          </div>
        </div>

        <Alert v-if="editError" variant="destructive">
          <AlertTitle>{{ $t('students.edit_error') }}</AlertTitle>
          <AlertDescription>{{ editError }}</AlertDescription>
        </Alert>

        <DialogFooter>
          <DialogClose as-child>
            <Button type="button" variant="outline">{{ $t('general.cancel') }}</Button>
          </DialogClose>
          <Button type="submit" :disabled="isUpdating || !props.student">
            <span v-if="isUpdating">{{ $t('general.loading') }}</span>
            <span v-else>{{ $t('general.save') }}</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
