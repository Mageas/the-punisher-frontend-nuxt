<script setup lang="ts">
const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { $api } = useNuxtApp()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

const name = ref('')
const year = ref('')
const submitting = ref(false)

const canSubmit = computed(() => name.value.trim().length > 0 && year.value.trim().length > 0)

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    name.value = ''
    year.value = ''
  }
})

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  clearErrors()

  try {
    await $api('/classrooms/', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        year: year.value.trim(),
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
        <DialogTitle>{{ t('modals.classroom.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.classroom.title') }}</DialogDescription>
      </DialogHeader>

      <form class="min-w-0 space-y-4" @submit.prevent="submit">
        <Alert v-if="globalError" variant="destructive">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <div class="space-y-2">
          <Label for="classroom-name">{{ t('modals.classroom.name') }}</Label>
          <Input
            id="classroom-name"
            v-model="name"
            type="text"
            :placeholder="t('modals.classroom.namePlaceholder')"
            :aria-invalid="!!fieldErrors.name"
            @input="clearFieldError('name')"
          />
          <p v-if="fieldErrors.name" class="text-sm text-destructive">
            {{ fieldErrors.name }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="classroom-year">{{ t('modals.classroom.year') }}</Label>
          <Input
            id="classroom-year"
            v-model="year"
            type="text"
            :placeholder="t('modals.classroom.yearPlaceholder')"
            :aria-invalid="!!fieldErrors.year"
            @input="clearFieldError('year')"
          />
          <p v-if="fieldErrors.year" class="text-sm text-destructive">
            {{ fieldErrors.year }}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
            {{ t('modals.classroom.cancel') }}
          </Button>
          <Button type="submit" class="cursor-pointer" :disabled="submitting || !canSubmit">
            {{ t('modals.classroom.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
