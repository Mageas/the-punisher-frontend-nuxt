<script setup lang="ts">
const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const props = defineProps<{
  classroomId: string | null
  name: string
  year: string
}>()

const { t } = useI18n()
const { $api } = useNuxtApp()
const { fieldErrors, globalError, handleApiError, clearErrors, clearFieldError } = useApiErrors()

const name = ref('')
const year = ref('')
const submitting = ref(false)

const canSubmit = computed(() => name.value.trim().length > 0 && year.value.trim().length > 0)

watch(open, (isOpen) => {
  if (!isOpen) return
  clearErrors()
  name.value = props.name
  year.value = props.year
})

async function submit() {
  if (!props.classroomId || !canSubmit.value) return
  submitting.value = true
  clearErrors()

  try {
    await $api(`/classrooms/${props.classroomId}`, {
      method: 'PUT',
      body: {
        name: name.value.trim(),
        year: year.value.trim(),
      },
    })
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
    <DialogContent class="min-w-0 overflow-x-hidden sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ t('modals.classroom.editTitle') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('modals.classroom.editTitle') }}</DialogDescription>
      </DialogHeader>

      <form class="min-w-0 space-y-4" @submit.prevent="submit">
        <Alert v-if="globalError" variant="destructive">
          <AlertDescription>{{ globalError }}</AlertDescription>
        </Alert>

        <div class="space-y-2">
          <Label for="classroom-edit-name">{{ t('modals.classroom.name') }}</Label>
          <Input
            id="classroom-edit-name"
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
          <Label for="classroom-edit-year">{{ t('modals.classroom.year') }}</Label>
          <Input
            id="classroom-edit-year"
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
            {{ t('modals.classroom.save') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
