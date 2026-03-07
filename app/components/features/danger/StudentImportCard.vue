<script setup lang="ts">
import { FileUp } from 'lucide-vue-next'
import { extractApiError } from '~/lib/api-error'
import {
  extractStudentImportRowErrors,
  getStudentImportGlobalErrorMessage,
  getStudentImportRowErrorMessage,
} from '~/lib/student-import'
import type { StudentImportResponse, StudentImportRowError } from '~/types/api'

const { t, te } = useI18n()
const studentService = useStudentService()

const dropzone = ref<{ resetFileInput: () => void } | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)

const importResult = ref<StudentImportResponse | null>(null)
const importErrors = ref<StudentImportRowError[]>([])
const globalError = ref<string | null>(null)

const acceptedTypes = '.csv,.xlsx'
const acceptedExtensions = ['.csv', '.xlsx']

useGlobalErrorToast(globalError)

function isAcceptedFile(file: File): boolean {
  const fileName = file.name.toLowerCase()
  return acceptedExtensions.some((extension) => fileName.endsWith(extension))
}

function setSelectedFile(file: File) {
  if (!isAcceptedFile(file)) {
    clearResults()
    dropzone.value?.resetFileInput()
    globalError.value = t('apiErrors.messages.import_file_invalid')
    return
  }

  selectedFile.value = file
  clearResults()
}

function clearResults() {
  importResult.value = null
  importErrors.value = []
  globalError.value = null
}

function clearFile() {
  if (uploading.value) return

  selectedFile.value = null
  dropzone.value?.resetFileInput()
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
      globalError.value = getStudentImportGlobalErrorMessage(apiError, t, te)
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

const displayedImportErrors = computed(() =>
  importErrors.value.map((error) => ({
    ...error,
    message: getStudentImportRowErrorMessage(error, t, te),
  })),
)
</script>

<template>
  <ActionPanelCard
    :title="t('dangerZone.importStudents.title')"
    :description="t('dangerZone.importStudents.description')"
    :icon="FileUp"
    variant="primary"
  >
    <StudentImportDropzone
      ref="dropzone"
      :accepted-types="acceptedTypes"
      :uploading="uploading"
      :selected-file-name="selectedFile?.name ?? null"
      @file-selected="setSelectedFile"
      @clear-file="clearFile"
      @import="handleImport"
    />

    <p class="text-xs text-muted-foreground">
      {{ t('dangerZone.importStudents.acceptedFormats') }}
    </p>

    <StudentImportSummary v-if="importSummary" :summary="importSummary" />

    <StudentImportErrorsTable v-if="displayedImportErrors.length > 0" :errors="displayedImportErrors" />
  </ActionPanelCard>
</template>
