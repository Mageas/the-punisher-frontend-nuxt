<script setup lang="ts">
import { Upload } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    acceptedTypes?: string
    uploading?: boolean
    selectedFileName?: string | null
  }>(),
  {
    acceptedTypes: '.csv,.xlsx',
    uploading: false,
    selectedFileName: null,
  },
)

const emit = defineEmits<{
  'file-selected': [file: File]
  'clear-file': []
  import: []
}>()

const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const isDraggingFile = ref(false)

function emitSelectedFile(file?: File | null) {
  if (!file) return
  emit('file-selected', file)
}

function resetFileInput() {
  isDraggingFile.value = false

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function openFilePicker() {
  if (props.uploading) return

  resetFileInput()
  fileInput.value?.click()
}

function onFileChange(event: Event) {
  if (props.uploading) return

  const target = event.target as HTMLInputElement
  emitSelectedFile(target.files?.[0] ?? null)
}

function onDragOver(event: DragEvent) {
  if (props.uploading) return

  event.preventDefault()
  isDraggingFile.value = true
}

function onDragEnter(event: DragEvent) {
  if (props.uploading) return

  event.preventDefault()
  isDraggingFile.value = true
}

function onDragLeave(event: DragEvent) {
  if (props.uploading) return

  const currentTarget = event.currentTarget
  const relatedTarget = event.relatedTarget

  if (
    currentTarget instanceof HTMLElement &&
    relatedTarget instanceof Node &&
    currentTarget.contains(relatedTarget)
  ) {
    return
  }

  isDraggingFile.value = false
}

function onDrop(event: DragEvent) {
  if (props.uploading) return

  event.preventDefault()
  isDraggingFile.value = false
  emitSelectedFile(event.dataTransfer?.files?.[0] ?? null)
}

defineExpose({
  openFilePicker,
  resetFileInput,
})
</script>

<template>
  <div
    class="rounded-lg border border-dashed p-4 transition-colors"
    :class="
      isDraggingFile
        ? 'border-primary bg-primary-bg-subtle'
        : 'border-border hover:border-primary-border'
    "
    data-testid="student-import-dropzone"
    @dragover.stop="onDragOver"
    @dragenter.stop="onDragEnter"
    @dragleave.stop="onDragLeave"
    @drop.stop="onDrop"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="props.acceptedTypes"
      class="hidden"
      @change="onFileChange"
    />

    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2 text-sm">
        <Upload class="size-4 text-muted-foreground" />
        <span class="font-medium">
          {{
            isDraggingFile
              ? t('dangerZone.importStudents.dropActive')
              : t('dangerZone.importStudents.dropHint')
          }}
        </span>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          class="cursor-pointer"
          :disabled="props.uploading"
          data-testid="student-import-select-file"
          @click="openFilePicker"
        >
          <Upload class="mr-2 size-4" />
          {{
            props.selectedFileName
              ? t('dangerZone.importStudents.changeFile')
              : t('dangerZone.importStudents.selectFile')
          }}
        </Button>

        <StudentImportSelectedFileRow
          v-if="props.selectedFileName"
          :file-name="props.selectedFileName"
          :disabled="props.uploading"
          @clear="emit('clear-file')"
        />

        <Button
          v-if="props.selectedFileName"
          size="sm"
          class="cursor-pointer"
          :disabled="props.uploading"
          data-testid="student-import-submit"
          @click="emit('import')"
        >
          {{
            props.uploading
              ? t('dangerZone.importStudents.uploading')
              : t('dangerZone.importStudents.button')
          }}
        </Button>
      </div>
    </div>
  </div>
</template>
