<script setup lang="ts">
const emit = defineEmits<{
  created: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  title: string
  placeholder: string
  createFn: (name: string) => Promise<void>
}>()

const { t } = useI18n()
const { fieldErrors, globalError, handleApiError, clearErrors } = useApiErrors()

const name = ref('')
const submitting = ref(false)
const canSubmit = computed(() => name.value.trim().length > 0)

watch(open, (isOpen) => {
  if (!isOpen) return
  clearErrors()
  name.value = ''
})

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  clearErrors()

  try {
    await props.createFn(name.value.trim())
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
    <DialogContent class="min-w-0 sm:max-w-md" @open-auto-focus.prevent>
      <DialogHeader>
        <DialogTitle>{{ props.title }}</DialogTitle>
        <DialogDescription class="sr-only">{{ props.title }}</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="submit">
        <Alert v-if="globalError" variant="destructive">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <div class="space-y-2">
          <Label>{{ t('typeManagement.name') }}</Label>
          <Input v-model="name" type="text" :placeholder="props.placeholder" />
          <p v-if="fieldErrors.name" class="text-sm text-destructive">
            {{ fieldErrors.name }}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
            {{ t('modals.delete.cancel') }}
          </Button>
          <Button type="submit" class="cursor-pointer" :disabled="submitting || !canSubmit">
            {{ t('typeManagement.create') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
