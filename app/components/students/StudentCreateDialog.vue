<script setup lang="ts">
import { parseApiError } from "@/lib/api-error"

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: "update:open", value: boolean): void
  (e: "created"): void
}>()

const { t } = useI18n()
const apiClient = useApiClient()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
})

const isCreating = ref(false)
const createError = ref<string | null>(null)

const form = reactive({
  firstName: "",
  lastName: "",
})

function resetForm() {
  form.firstName = ""
  form.lastName = ""
}

// Reset form when dialog opens
watch(isOpen, (newValue) => {
  if (newValue) {
    createError.value = null
    resetForm()
  }
})

async function submit() {
  if (isCreating.value) return

  const firstName = form.firstName.trim()
  const lastName = form.lastName.trim()

  if (!firstName || !lastName) {
    createError.value = t('students.validation_error')
    return
  }

  isCreating.value = true
  createError.value = null

  try {
    await apiClient.apiFetch("/students", {
      method: "POST",
      body: {
        first_name: firstName,
        last_name: lastName,
      },
    })

    emit("created")
    isOpen.value = false
  } catch (error) {
    createError.value = parseApiError(error).message
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ $t('students.add_title') }}</DialogTitle>
        <DialogDescription>
          {{ $t('students.add_description') }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="create-first-name">{{ $t('students.firstname') }}</Label>
            <Input
              id="create-first-name"
              v-model="form.firstName"
              placeholder="Lina"
              autocomplete="given-name"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="create-last-name">{{ $t('students.lastname') }}</Label>
            <Input
              id="create-last-name"
              v-model="form.lastName"
              placeholder="Martin"
              autocomplete="family-name"
              required
            />
          </div>
        </div>

        <Alert v-if="createError" variant="destructive">
          <AlertTitle>{{ $t('students.create_error') }}</AlertTitle>
          <AlertDescription>{{ createError }}</AlertDescription>
        </Alert>

        <DialogFooter>
          <DialogClose as-child>
            <Button type="button" variant="outline">{{ $t('general.cancel') }}</Button>
          </DialogClose>
          <Button type="submit" :disabled="isCreating">
            <span v-if="isCreating">{{ $t('general.loading') }}</span>
            <span v-else>{{ $t('general.save') }}</span>
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
