<script setup lang="ts">
const emit = defineEmits<{
  confirmed: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = withDefaults(
  defineProps<{
    itemId: string | null
    actionFn: (id: string) => Promise<void>
    title: string
    message: string
    warningMessage?: string
    cancelLabel: string
    confirmLabel: string
    confirmVariant?: 'default' | 'destructive'
    lockDurationSeconds?: number
  }>(),
  {
    confirmVariant: 'default',
    lockDurationSeconds: 0,
    warningMessage: undefined,
  },
)

const { globalError, handleApiError, clearErrors } = useApiErrors()
const submitting = ref(false)
const lockSecondsLeft = ref(0)
let lockInterval: ReturnType<typeof setInterval> | null = null

const confirmButtonLabel = computed(() => {
  if (lockSecondsLeft.value <= 0) return props.confirmLabel
  return `${props.confirmLabel} (${lockSecondsLeft.value}s)`
})

function clearLockTimer() {
  if (!lockInterval) return
  clearInterval(lockInterval)
  lockInterval = null
}

function startLockTimer() {
  clearLockTimer()
  lockSecondsLeft.value = props.lockDurationSeconds
  if (lockSecondsLeft.value <= 0) return

  lockInterval = setInterval(() => {
    if (lockSecondsLeft.value <= 1) {
      lockSecondsLeft.value = 0
      clearLockTimer()
      return
    }

    lockSecondsLeft.value -= 1
  }, 1000)
}

watch(open, (isOpen) => {
  if (isOpen) {
    clearErrors()
    startLockTimer()
    return
  }

  clearLockTimer()
  lockSecondsLeft.value = 0
})

async function confirm() {
  if (!props.itemId || lockSecondsLeft.value > 0) return
  submitting.value = true
  clearErrors()
  try {
    await props.actionFn(props.itemId)
    open.value = false
    emit('confirmed')
  } catch (err) {
    handleApiError(err)
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => {
  clearLockTimer()
})
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
      <p v-if="warningMessage" class="text-sm font-medium text-red-500">
        {{ warningMessage }}
      </p>

      <DialogFooter>
        <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
          {{ cancelLabel }}
        </Button>
        <Button
          type="button"
          :variant="confirmVariant"
          class="cursor-pointer"
          :disabled="submitting || lockSecondsLeft > 0"
          @click="confirm"
        >
          {{ confirmButtonLabel }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
