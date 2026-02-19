<script setup lang="ts">
const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { globalError, handleApiError, clearErrors } = useApiErrors()
const submitting = ref(false)

const props = defineProps<{
  bonusId: string | null
  useFn: (id: string) => Promise<void>
}>()

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
  }
})

async function confirm() {
  if (!props.bonusId) return
  submitting.value = true
  clearErrors()
  try {
    await props.useFn(props.bonusId)
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
        <DialogTitle>{{ t('modals.use.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.use.title') }}</DialogDescription>
      </DialogHeader>

      <Alert v-if="globalError" variant="destructive">
        <AlertDescription>{{ globalError }}</AlertDescription>
      </Alert>

      <p class="text-sm text-muted-foreground">
        {{ t('modals.use.bonusMessage') }}
      </p>

      <DialogFooter>
        <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
          {{ t('modals.use.cancel') }}
        </Button>
        <Button
          type="button"
          class="cursor-pointer"
          :disabled="submitting"
          @click="confirm"
        >
          {{ t('modals.use.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
