<script setup lang="ts">
const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const { globalError, handleApiError, clearErrors } = useApiErrors()
const submitting = ref(false)

const props = defineProps<{
  punishmentId: string | null
  resolveFn: (id: string) => Promise<void>
}>()

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
  }
})

async function confirm() {
  if (!props.punishmentId) return
  submitting.value = true
  clearErrors()
  try {
    await props.resolveFn(props.punishmentId)
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
        <DialogTitle>{{ t('modals.resolve.title') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.resolve.title') }}</DialogDescription>
      </DialogHeader>

      <Alert v-if="globalError" variant="destructive">
        <AlertDescription>{{ globalError }}</AlertDescription>
      </Alert>

      <p class="text-sm text-muted-foreground">
        {{ t('modals.resolve.punishmentMessage') }}
      </p>

      <DialogFooter>
        <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
          {{ t('modals.resolve.cancel') }}
        </Button>
        <Button
          type="button"
          class="cursor-pointer"
          :disabled="submitting"
          @click="confirm"
        >
          {{ t('modals.resolve.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
