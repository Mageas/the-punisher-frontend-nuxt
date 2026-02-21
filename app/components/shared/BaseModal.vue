<script setup lang="ts">
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'

const props = defineProps<{
  title?: string
  description?: string
  globalError?: string | null
  submitting?: boolean
  canSubmit?: boolean
  submitText?: string
  cancelText?: string
  hideFooter?: boolean
  destructive?: boolean
  preventAutoFocus?: boolean
}>()

const emit = defineEmits<{
  submit: []
}>()

const open = defineModel<boolean>('open', { default: false })
const { t } = useI18n()

function handleSubmit() {
  if (props.canSubmit !== false && !props.submitting) {
    emit('submit')
  }
}

function onOpenAutoFocus(event: Event) {
  if (props.preventAutoFocus) {
    event.preventDefault()
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="min-w-0 sm:max-w-md overflow-visible"
      @open-auto-focus="onOpenAutoFocus"
    >
      <DialogHeader>
        <DialogTitle v-if="title">
          {{ title }}
        </DialogTitle>
        <DialogDescription :class="description ? '' : 'sr-only'">
          {{ description || title }}
        </DialogDescription>
      </DialogHeader>

      <form class="min-w-0 space-y-4" @submit.prevent="handleSubmit">
        <Alert v-if="globalError" variant="destructive">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <slot />

        <DialogFooter v-if="!hideFooter">
          <Button
            type="button"
            variant="outline"
            class="cursor-pointer"
            @click="open = false"
          >
            {{ cancelText || t('common.cancel') }}
          </Button>
          <Button
            type="submit"
            class="cursor-pointer"
            :variant="destructive ? 'destructive' : 'default'"
            :disabled="submitting || canSubmit === false"
          >
            <span v-if="submitting" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {{ submitText || t('common.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
