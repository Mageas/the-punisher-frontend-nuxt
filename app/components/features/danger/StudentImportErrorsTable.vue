<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import type { StudentImportRowError } from '~/types/api'

defineProps<{
  errors: Array<StudentImportRowError & { message: string }>
}>()

const { t } = useI18n()
</script>

<template>
  <Alert variant="destructive" data-testid="student-import-errors-table">
    <AlertTriangle class="size-4" />
    <AlertTitle>{{ t('dangerZone.importStudents.errorTitle') }}</AlertTitle>
    <AlertDescription>
      <div class="mt-2 max-h-60 overflow-y-auto rounded-md border border-destructive-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-20">
                {{ t('dangerZone.importStudents.errorRowHeader') }}
              </TableHead>
              <TableHead>{{ t('dangerZone.importStudents.errorFieldHeader') }}</TableHead>
              <TableHead>{{ t('dangerZone.importStudents.errorMessageHeader') }}</TableHead>
              <TableHead>{{ t('dangerZone.importStudents.errorValueHeader') }}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="(error, idx) in errors"
              :key="`${error.row}-${error.field}-${error.error}-${idx}`"
              data-testid="student-import-error-row"
            >
              <TableCell class="font-mono text-xs">{{ error.row }}</TableCell>
              <TableCell class="text-xs">{{ error.field }}</TableCell>
              <TableCell class="text-xs">{{ error.message }}</TableCell>
              <TableCell class="font-mono text-xs">{{ error.value || '—' }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </AlertDescription>
  </Alert>
</template>
