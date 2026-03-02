<script setup lang="ts">
import {
  FileUp,
  Upload,
  CheckCircle,
  AlertTriangle,
  X,
  Users,
  School,
  Link2,
} from 'lucide-vue-next'
import { extractApiError } from '~/lib/api-error'
import { extractStudentImportRowErrors } from '~/lib/student-import'
import type { StudentImportResponse, StudentImportRowError } from '~/types/api'

const { t, te } = useI18n()
const studentService = useStudentService()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const isDraggingFile = ref(false)

const importResult = ref<StudentImportResponse | null>(null)
const importErrors = ref<StudentImportRowError[]>([])
const globalError = ref<string | null>(null)

const acceptedTypes = '.csv,.xlsx'
const acceptedExtensions = ['.csv', '.xlsx']

function isAcceptedFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  return acceptedExtensions.some((extension) => fileName.endsWith(extension))
}

function setSelectedFile(file: File) {
  if (!isAcceptedFile(file)) {
    importResult.value = null
    importErrors.value = []
    globalError.value = t('apiErrors.messages.import_file_invalid')
    return
  }

  selectedFile.value = file
  clearResults()
}

function onFileChange(event: Event) {
  if (uploading.value) return

  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    setSelectedFile(file)
  }
}

function onDropZoneDragOver(event: DragEvent) {
  if (uploading.value) return

  event.preventDefault()
  isDraggingFile.value = true
}

function onDropZoneDragEnter(event: DragEvent) {
  if (uploading.value) return

  event.preventDefault()
  isDraggingFile.value = true
}

function onDropZoneDragLeave(event: DragEvent) {
  if (uploading.value) return

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

function onDropZoneDrop(event: DragEvent) {
  if (uploading.value) return

  event.preventDefault()
  isDraggingFile.value = false

  const file = event.dataTransfer?.files?.[0]
  if (file) {
    setSelectedFile(file)
  }
}

function triggerFileSelect() {
  if (uploading.value) return

  fileInput.value?.click()
}

function clearResults() {
  importResult.value = null
  importErrors.value = []
  globalError.value = null
}

function clearFile() {
  if (uploading.value) return

  isDraggingFile.value = false
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  clearResults()
}

async function handleImport() {
  if (!selectedFile.value || uploading.value) return

  clearResults()
  uploading.value = true

  try {
    const result = await studentService.importStudents(selectedFile.value)
    importResult.value = result

    importErrors.value = extractStudentImportRowErrors(result.errors)
  } catch (err: unknown) {
    const apiError = extractApiError(err)

    if (apiError) {
      importErrors.value = extractStudentImportRowErrors(apiError.error_details)
      const i18nKey = `apiErrors.messages.${apiError.error}`
      globalError.value = te(i18nKey) ? t(i18nKey) : t('apiErrors.messages.internal_error')
    } else {
      globalError.value = t('apiErrors.messages.internal_error')
    }
  } finally {
    uploading.value = false
  }
}

const importSummary = computed(() => {
  if (!importResult.value) return null
  return importResult.value.summary
})
</script>

<template>
  <div
    class="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-primary-border hover:shadow-sm"
  >
    <div class="flex items-start gap-4">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-info-bg-subtle text-info-foreground transition-colors group-hover:bg-info-bg-subtle-hover"
      >
        <FileUp class="size-5" />
      </div>
      <div class="flex-1 min-w-0 space-y-3">
        <div class="space-y-1">
          <h3 class="text-sm font-semibold leading-none tracking-tight">
            {{ t('dangerZone.importStudents.title') }}
          </h3>
          <p class="text-sm text-muted-foreground leading-relaxed">
            {{ t('dangerZone.importStudents.description') }}
          </p>
        </div>

        <div
          class="rounded-lg border border-dashed p-4 transition-colors"
          :class="
            isDraggingFile
              ? 'border-primary bg-primary-bg-subtle'
              : 'border-border hover:border-primary-border'
          "
          @dragover.stop="onDropZoneDragOver"
          @dragenter.stop="onDropZoneDragEnter"
          @dragleave.stop="onDropZoneDragLeave"
          @drop.stop="onDropZoneDrop"
        >
          <input
            ref="fileInput"
            type="file"
            :accept="acceptedTypes"
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

            <div class="flex items-center gap-3 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                class="cursor-pointer"
                :disabled="uploading"
                @click="triggerFileSelect"
              >
                <Upload class="size-4 mr-2" />
                {{
                  selectedFile
                    ? t('dangerZone.importStudents.changeFile')
                    : t('dangerZone.importStudents.selectFile')
                }}
              </Button>

              <div
                v-if="selectedFile"
                class="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span class="truncate max-w-48">{{ selectedFile.name }}</span>
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                  :disabled="uploading"
                  :aria-label="t('dangerZone.importStudents.clearFile')"
                  @click="clearFile"
                >
                  <X class="size-3.5" />
                </button>
              </div>

              <Button
                v-if="selectedFile"
                size="sm"
                class="cursor-pointer"
                :disabled="uploading"
                @click="handleImport"
              >
                {{
                  uploading
                    ? t('dangerZone.importStudents.uploading')
                    : t('dangerZone.importStudents.button')
                }}
              </Button>
            </div>
          </div>
        </div>

        <p class="text-xs text-muted-foreground">
          {{ t('dangerZone.importStudents.acceptedFormats') }}
        </p>

        <!-- Success result -->
        <div v-if="importSummary" class="rounded-lg border border-success-border overflow-hidden">
          <!-- Header -->
          <div
            class="flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-success-bg-subtle px-4 py-2.5 border-b border-success-border"
          >
            <CheckCircle class="size-4 text-success-foreground shrink-0" />
            <span class="text-sm font-semibold text-success-foreground">
              {{ t('dangerZone.importStudents.successTitle') }}
            </span>
            <span class="sm:ml-auto text-xs text-success-foreground">
              {{
                t('dangerZone.importStudents.summaryProcessed', {
                  processed: importSummary.rows_processed,
                  total: importSummary.rows_total,
                })
              }}
            </span>
          </div>

          <!-- Stat cards -->
          <div
            class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border"
          >
            <!-- Students -->
            <div class="p-3.5 space-y-1">
              <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users class="size-3.5" />
                {{ t('dangerZone.importStudents.summaryStudents') }}
              </div>
              <div class="flex items-baseline gap-1.5">
                <span
                  class="text-xl font-bold tabular-nums tracking-tight"
                  :class="
                    importSummary.students_created > 0
                      ? 'text-success-foreground'
                      : 'text-foreground'
                  "
                >
                  {{ importSummary.students_created }}
                </span>
                <span class="text-xs text-muted-foreground">
                  {{ t('dangerZone.importStudents.summaryStudentsCreated') }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground">
                {{ importSummary.students_existing }}
                {{ t('dangerZone.importStudents.summaryStudentsExisting') }}
              </p>
            </div>

            <!-- Classrooms -->
            <div class="p-3.5 space-y-1">
              <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <School class="size-3.5" />
                {{ t('dangerZone.importStudents.summaryClassrooms') }}
              </div>
              <div class="flex items-baseline gap-1.5">
                <span
                  class="text-xl font-bold tabular-nums tracking-tight"
                  :class="
                    importSummary.classrooms_created > 0
                      ? 'text-success-foreground'
                      : 'text-foreground'
                  "
                >
                  {{ importSummary.classrooms_created }}
                </span>
                <span class="text-xs text-muted-foreground">
                  {{ t('dangerZone.importStudents.summaryClassroomsCreated') }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground">
                {{ importSummary.classrooms_existing }}
                {{ t('dangerZone.importStudents.summaryClassroomsExisting') }}
              </p>
            </div>

            <!-- Links -->
            <div class="p-3.5 space-y-1">
              <div class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Link2 class="size-3.5" />
                {{ t('dangerZone.importStudents.summaryLinks') }}
              </div>
              <div class="flex items-baseline gap-1.5">
                <span
                  class="text-xl font-bold tabular-nums tracking-tight"
                  :class="
                    importSummary.links_created > 0 ? 'text-success-foreground' : 'text-foreground'
                  "
                >
                  {{ importSummary.links_created }}
                </span>
                <span class="text-xs text-muted-foreground">
                  {{ t('dangerZone.importStudents.summaryLinksCreated') }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground">
                {{ importSummary.links_existing }}
                {{ t('dangerZone.importStudents.summaryLinksExisting') }}
              </p>
            </div>
          </div>

          <!-- Rows failed -->
          <div
            v-if="importSummary.rows_failed > 0"
            class="flex items-center gap-2 px-4 py-2 border-t border-destructive-border bg-destructive-bg-subtle text-xs font-medium text-destructive"
          >
            <AlertTriangle class="size-3.5" />
            {{ importSummary.rows_failed }}
            {{ t('dangerZone.importStudents.rowsFailed').toLowerCase() }}
          </div>
        </div>

        <!-- Global error -->
        <Alert v-if="globalError" variant="destructive">
          <AlertTriangle class="size-4" />
          <AlertTitle>{{ globalError }}</AlertTitle>
        </Alert>

        <!-- Row-level errors -->
        <div v-if="importErrors.length > 0" class="space-y-2">
          <Alert variant="destructive">
            <AlertTriangle class="size-4" />
            <AlertTitle>{{ t('dangerZone.importStudents.errorTitle') }}</AlertTitle>
            <AlertDescription>
              <div
                class="mt-2 max-h-60 overflow-y-auto rounded-md border border-destructive-border"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-20">{{
                        t('dangerZone.importStudents.errorRowHeader')
                      }}</TableHead>
                      <TableHead>{{ t('dangerZone.importStudents.errorFieldHeader') }}</TableHead>
                      <TableHead>{{ t('dangerZone.importStudents.errorMessageHeader') }}</TableHead>
                      <TableHead>{{ t('dangerZone.importStudents.errorValueHeader') }}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="(err, idx) in importErrors" :key="idx">
                      <TableCell class="font-mono text-xs">{{ err.row }}</TableCell>
                      <TableCell class="text-xs">{{ err.field }}</TableCell>
                      <TableCell class="text-xs">{{ err.error }}</TableCell>
                      <TableCell class="text-xs font-mono">{{ err.value || '—' }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  </div>
</template>
