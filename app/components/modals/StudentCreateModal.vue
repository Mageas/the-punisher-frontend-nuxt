<script setup lang="ts">
const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { $api } = useNuxtApp()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

const firstName = ref('')
const lastName = ref('')
const submitting = ref(false)

const canSubmit = computed(() => firstName.value.trim().length > 0 && lastName.value.trim().length > 0)

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    firstName.value = ''
    lastName.value = ''
  }
})

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  clearErrors()

  try {
    await $api('/students/', {
      method: 'POST',
      body: {
        first_name: firstName.value.trim(),
        last_name: lastName.value.trim(),
      },
    })
    open.value = false
    emit('created')
  }
  catch (err) {
    handleApiError(err)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="min-w-0 overflow-x-hidden sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('modals.student.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.student.title') }}</DialogDescription>
      </DialogHeader>

      <form class="min-w-0 space-y-4" @submit.prevent="submit">
        <Alert v-if="globalError" variant="destructive">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <div class="space-y-2">
          <Label for="student-last-name">{{ t('modals.student.lastName') }}</Label>
          <Input
            id="student-last-name"
            v-model="lastName"
            type="text"
            :placeholder="t('modals.student.lastNamePlaceholder')"
            :aria-invalid="!!fieldErrors.last_name"
            @input="clearFieldError('last_name')"
          />
          <p v-if="fieldErrors.last_name" class="text-sm text-destructive">
            {{ fieldErrors.last_name }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="student-first-name">{{ t('modals.student.firstName') }}</Label>
          <Input
            id="student-first-name"
            v-model="firstName"
            type="text"
            :placeholder="t('modals.student.firstNamePlaceholder')"
            :aria-invalid="!!fieldErrors.first_name"
            @input="clearFieldError('first_name')"
          />
          <p v-if="fieldErrors.first_name" class="text-sm text-destructive">
            {{ fieldErrors.first_name }}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
            {{ t('modals.student.cancel') }}
          </Button>
          <Button type="submit" class="cursor-pointer" :disabled="submitting || !canSubmit">
            {{ t('modals.student.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
