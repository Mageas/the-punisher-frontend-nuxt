<script setup lang="ts">
interface EditableType {
  id: string
  name: string
}

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  item: EditableType | null
  title: string
  updateFn: (id: string, name: string) => Promise<void>
}>()

const { t } = useI18n()
const { fieldErrors, globalError, handleApiError, clearErrors } = useApiErrors()

const name = ref('')
const submitting = ref(false)
const canSubmit = computed(() => !!props.item?.id && name.value.trim().length > 0)

watch(open, (isOpen) => {
  if (!isOpen || !props.item) return
  clearErrors()
  name.value = props.item.name
})

async function submit() {
  if (!props.item?.id || !canSubmit.value) return
  submitting.value = true
  clearErrors()

  try {
    await props.updateFn(props.item.id, name.value.trim())
    open.value = false
    emit('updated')
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
          <Input v-model="name" type="text" />
          <p v-if="fieldErrors.name" class="text-sm text-destructive">
            {{ fieldErrors.name }}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
            {{ t('modals.delete.cancel') }}
          </Button>
          <Button type="submit" class="cursor-pointer" :disabled="submitting || !canSubmit">
            {{ t('typeManagement.save') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
