<script setup lang="ts">
import { Button } from '~/components/ui/button'
import LoadingButton from '~/components/shared/LoadingButton.vue'
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

useGlobalErrorToast(() => props.globalError)

function handleSubmit() {
  if (!props.submitting) {
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
    <DialogContent class="min-w-0 sm:max-w-md overflow-visible" @open-auto-focus="onOpenAutoFocus">
      <DialogHeader>
        <DialogTitle v-if="title">
          {{ title }}
        </DialogTitle>
        <DialogDescription :class="description ? '' : 'sr-only'">
          {{ description || title }}
        </DialogDescription>
      </DialogHeader>

      <form class="min-w-0 space-y-4" @submit.prevent="handleSubmit">
        <slot />

        <DialogFooter v-if="!hideFooter">
          <Button type="button" variant="outline" class="cursor-pointer" @click="open = false">
            {{ cancelText || t('common.actions.cancel') }}
          </Button>
          <LoadingButton
            type="submit"
            class="cursor-pointer"
            :variant="destructive ? 'destructive' : 'default'"
            :loading="submitting"
          >
            {{ submitText || t('common.actions.submit') }}
          </LoadingButton>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
