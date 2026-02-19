<script setup lang="ts">
const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(defineProps<{
  itemId: string | null
  actionFn: (id: string) => Promise<void>
  title: string
  message: string
  cancelLabel: string
  confirmLabel: string
  confirmVariant?: 'default' | 'destructive'
}>(), {
  confirmVariant: 'default',
})

const { globalError, handleApiError, clearErrors } = useApiErrors()
const submitting = ref(false)

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
  }
})

async function confirm() {
  if (!props.itemId) return
  submitting.value = true
  clearErrors()
  try {
    await props.actionFn(props.itemId)
    open.value = false
    emit('confirmed')
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
    <DialogContent class="min-w-0 overflow-x-hidden sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription class="sr-only">{{ title }}</DialogDescription>
      </DialogHeader>

      <Alert v-if="globalError" variant="destructive">
        <AlertDescription>{{ globalError }}</AlertDescription>
      </Alert>

      <p class="text-sm text-muted-foreground">
        {{ message }}
      </p>

      <DialogFooter>
        <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
          {{ cancelLabel }}
        </Button>
        <Button
          type="button"
          :variant="confirmVariant"
          class="cursor-pointer"
          :disabled="submitting"
          @click="confirm"
        >
          {{ confirmLabel }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
